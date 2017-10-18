<template>
  <div id="app">
    <div id="background">
      <el-select v-model="song" placeholder="Select" :value="song" @change="playAnother()" :style="{'position': 'absolute'}">
        <el-option
                v-for="item in options"
                :key="item"
                :label="item"
                :value="item">
        </el-option>
      </el-select>
      <!-- <audio id="myAudio" src="../ID.mp3"></audio> -->
      <div id="container" :style="{'width': container + 'px', 'height': container + 'px'}" @click="play()">
        <bar v-for="i in mData" :height="i"></bar>
        <bar v-for="i in reverseData()" :height="i"></bar>
        <bar v-for="i in mData" :height="i"></bar>
        <bar v-for="i in reverseData()" :height="i"></bar>
        <bar v-for="i in mData" :height="i"></bar>
        <bar v-for="i in reverseData()" :height="i"></bar>
        <bar v-for="i in mData" :height="i"></bar>
        <bar v-for="i in reverseData()" :height="i"></bar>
        <div id="progress-container"></div>
      </div>
    </div>

  </div>
</template>

<script>
    import Vue from "vue";
    import Bar from "./bar.vue";
    import Taira from "taira";
    import element from 'element-ui';
    import ProgressBar from 'progressbar.js';

    export default {
        components: {Bar, element},
        name: 'app',
        data () {
            return {
                num: 32,      // number of bars
                trim: 2,
                offset: 3,
                container: 700,
                maxDeci: 0,
                minDeci: -60,
                song: "ID",
                options: ['gai', 'culture', 'headlights', 'ID'],

                radius: 250,  // radius size
                factor: 8,    //
                start: 100,   //
                base: 4,      //

                // these would be reset later
                frequencyData: new Uint8Array(this.num),
                trimmedData: 0,
                playing: false,
                analyser: null,
                audio: null,
                ctx: null,

                circe: null,
                loaded: false,

                set: false,
                mData: [],
            }
        },
        created: function () {
            this.setup();
        },
        methods: {
            pathGenerator () {
                return "/dist/music/" + this.song + ".mp3";
            },
            setup: function() {

                this.frequencyData.fill(0);

                this.trimmedData = this.num / 2 - this.trim - this.offset;
                for (let i = this.offset; i < this.trimmedData + this.offset; i++) {
                    this.mData.push(0);
                }
                this.mData.fill(0);

                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();

                this.audio = new Audio(this.pathGenerator());
                this.audio.crossOrigin = "anonymous";
                this.audio.addEventListener('loadedmetadata', function() {
                    this.loaded = true;
                }.bind(this));

                let audioSrc = this.ctx.createMediaElementSource(this.audio);
                this.analyser = this.ctx.createAnalyser();

                audioSrc.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
                // we have to connect the MediaElementSource with the analyser
                // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)

                // frequencyBinCount tells you how many values you'll receive from the analyser
                this.analyser.fftSize = this.num;
                this.analyser.minDecibels = this.minDeci;
                this.analyser.maxDecibels = this.maxDeci;
                this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

                // we're ready to receive some data!
                // loop
            },
            renderFrame() {
                requestAnimationFrame(this.renderFrame);
                // update data in frequencyData
                if (this.playing) {
                    this.analyser.getByteFrequencyData(this.frequencyData);
                    let temp = Taira.smoothen(this.frequencyData, Taira.ALGORITHMS.AVERAGE, 3, 0.5, false);
                    for (let i = 0; i < this.trimmedData; i++) {
                        // this.mData.splice(i, 1, res[i]);
                        // this.mData.splice(i, 1, Math.pow(this.frequencyData[i], 1.5)/32);
                        // this.mData.splice(i, 1, this.frequencyData[i] * 5/9);

                        // smoothened
                        this.mData.splice(i, 1, Math.pow(temp[i + this.offset], 1));
                    }
                }
                // render frame based on values in frequencyData
            },
            play: function () {
                if (!this.playing && this.loaded) {
                    this.audio.play();
                    this.renderFrame();
                    this.playing = true;

                    this.circe.animate(1, {
                        duration: this.audio.duration * 1000,
                    });
                } else {
                    this.audio.pause();
                    this.playing = false;

                    this.circe.stop();
                }
            },
            reverseData() {
                let x = this.mData.slice().reverse();
                return x;
            },
            playAnother () {
                this.playing = false;
                this.audio.pause();
                this.audio = new Audio(this.pathGenerator());
                this.audio.currentTime = 0.0;

                let audioSrc = this.ctx.createMediaElementSource(this.audio);
                this.analyser = this.ctx.createAnalyser();
                this.analyser.fftSize = this.num;
                audioSrc.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
                this.analyser.minDecibels = this.minDeci;
                this.analyser.maxDecibels = this.maxDeci;
                this.circe.set(0);
            },
            getTimeString(sec) {
                let min = Math.floor(Math.round(sec) / 60);
                sec = Math.round(sec) % 60;
                if (sec < 10) {
                    return min + ":0" + sec;
                }
                return min + ":" + sec;
            }
        },
        mounted() {
            // a full circle
            let twoPi = 2 * Math.PI;
            let bars = document.getElementsByClassName("bar-wrap");
            // you want to align objectsCount objects on the circular path
            // with constant distance between neighbors
            let change = twoPi / bars.length;
            
            let j = 0;
            let center = this.container / 2;
            
            for (let i = change / 2; i < twoPi; i += change) {
                let x = this.radius * Math.sin(i );
                let y = this.radius * Math.cos(i);
                // rotation of object in radians
                let rotation = i;
                // set the CSS properties to calculated values
                if (bars[j] !== undefined && bars[j] !== null) {
                    bars[j].style.left = (center + x - 5) + "px";
                    bars[j].style.top = (center + y) + "px";
                    bars[j].style.transform = 'rotate(' + - i + 'rad)';
                }
                j++;
            }
  
            let x = document.getElementById('progress-container');
            this.circe = new ProgressBar.Circle(x, {
                strokeWidth: 3,
                easing: 'linear',
                color: '#FFEA82',
                trailColor: 'rgba(255, 255, 255, 0.2)',
                trailWidth: 0.5,
                svgStyle: null,
                text: {
                    autoStyleContainer: false
                },
                step: function(state, circle) {
                    circle.setText(this.getTimeString(this.audio.currentTime));
                }.bind(this)
            });
            this.circe.text.style.fontFamily = 'Helvetica, sans-serif';
            this.circe.text.style.fontSize = '80px';
        }
    }
    // linear-gradient(to bottom, rgba(0,168,255,0.5), #157cad)
</script>

<style>
  
  body {
    padding: 0;
    margin: 0;
  }
  
  button {
    position: absolute;
  }

  #background {
    background: linear-gradient(to top, rgba(0,168,255,1), #42b983);
    position: absolute;
    width: 100vw;
    height: auto;
  }
  
  #container {
    margin: auto;
    position: relative;
  }
  
  #container:hover {
    cursor: pointer;
  }
  
  #progress-container {
    width: 300px;
    height: 300px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
</style>
