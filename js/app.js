import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import fragment_vid from "./shader/fragment_vid.glsl";
import vertex_vid from "./shader/vertex_vid.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";

import chars from "../img/T_Text.jpg";



export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.count = 0;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      5
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 1);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;

    this.gridSize = 1;
    this.size = 50;
    this.cellSize = this.gridSize/ this.size; // 1/50

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();
    this.initVideo();
  }

  // Manipulating video using canvas from MDN
  // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas

  initVideo(){
    this.video = document.getElementById('video');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    document.body.appendChild(this.canvas);

    this.canvas_vid = document.createElement('canvas');
    this.ctx_vid = this.canvas_vid.getContext('2d');
    this.canvas_vid.width = 1024;
    this.canvas_vid.height = 1024;

    document.body.appendChild(this.canvas_vid);

    this.mc = new THREE.CanvasTexture(this.canvas_vid);
    this.material_vid.uniforms.canvas.value = this.mc;
    this.mc.needsUpdate = true;

    this.video.addEventListener('play', () => {
        // this.width = video.videoWidth / 2;
        // this.height = video.videoHeight / 2;
        this.timerCallback();
      }, false);
  }

  timerCallback(){
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    setTimeout(() => {
        this.timerCallback();
      }, 1/30);
  }

  computeFrame() {
    let scales = new Float32Array(this.size**2);
    this.ctx.drawImage(this.video,0,0, this.size, this.size);
    this.ctx_vid.drawImage(this.video,0,0, 1024, 1024);
    let imageData = this.ctx.getImageData(0, 0, this.size, this.size);
    // console.log(imageData.data[0]);

    
    for (let i = 0; i < imageData.data.length; i+=4) {
      // let x = (i/4) % this.size;
      // let y = Math.floor((i/4)/this.size);

      scales.set([1 - imageData.data[i]/255],i/4);
      // scales[i/4] = imageData.data[i]/255;
    }
    

    /*
    for (let i = 0; i < imageData.data.length/4; i++) {
      const i4 = i * 4;
      scales[i] = imageData.data[i4]/255;
    }
    */
    
    // console.log(imageData.data);
    this.mesh.geometry.attributes.instanceScale.array = scales;
    this.mesh.geometry.attributes.instanceScale.needsUpdate = true;
    this.mc.needsUpdate = true;

    // this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
    // const frame = this.ctx1.getImageData(0, 0, this.width, this.height);
    // const length = frame.data.length;
    // const data = frame.data;

    // for (let i = 0; i < length; i += 4) {
    //   const red = data[i + 0];
    //   const green = data[i + 1];
    //   const blue = data[i + 2];
    //   if (green > 100 && red > 100 && blue < 43) {
    //     data[i + 3] = 0;
    //   }
    // }
    // this.ctx2.putImageData(frame, 0, 0);
  };

  settings() {
    let that = this;
    this.settings = {
      progress: 0.5,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    

    // image cover
    this.imageAspect = 1;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;


    this.camera.updateProjectionMatrix();


  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        chars : {value : new THREE.TextureLoader().load(chars)},
        progress: { value: 0.6 },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    

    
    this.geometry = new THREE.PlaneBufferGeometry(this.cellSize, this.cellSize, 1, 1);

    this.mesh = new THREE.InstancedMesh(this.geometry,this.material, this.size**2)
    
    const dummy = new THREE.Object3D();
    let count = 0;

    let scales = new Float32Array(this.size**2);

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        // dummy.position.set(i*this.cellSize - this.gridSize/2, j*this.cellSize - this.gridSize/2);
        dummy.position.set(j*this.cellSize - this.gridSize/2, -i*this.cellSize + this.gridSize/2);
        dummy.updateMatrix();
        
        // scales.set([Math.random()], count); // ???count???

        this.mesh.setMatrixAt( count ++, dummy.matrix );
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    // console.log(scales);
    this.mesh.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1));
    
    this.scene.add(this.mesh);

    this.geometry_vid = new THREE.PlaneBufferGeometry(1, 1);
    
    console.log(this.geometry_vid);
    this.material_vid = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        canvas : {value : null},
        chars : {value : new THREE.TextureLoader().load(chars)},
        progress: { value: 0.6 },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex_vid,
      fragmentShader: fragment_vid
    });
    this.mesh_vid = new THREE.Mesh(this.geometry_vid, this.material_vid);
    this.mesh_vid.position.set( -this.cellSize/2, this.cellSize/2, 0.001);
    console.log(this.mesh_vid);
    
    this.scene.add(this.mesh_vid);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;

    this.material_vid.uniforms.progress.value = this.settings.progress;

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);

  }
}

new Sketch({
  dom: document.getElementById("container")
});
