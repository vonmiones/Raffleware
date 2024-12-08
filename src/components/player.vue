<template>
    <div class="background-video-container">
      <video
        ref="videoPlayer"
        class="video-js vjs-default-skin"
        playsinline
        muted
        autoplay
        loop
      ></video>
      <div class="content">
      </div>
    </div>
  </template>
  
  <script>
  import videojs from 'video.js';
  
  export default {
    name: 'BackgroundVideo',
    props: {
      videoSrc: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        player: null
      };
    },
    mounted() {
      this.player = videojs(this.$refs.videoPlayer, {
        autoplay: true,
        muted: true,
        loop: true,
        controls: false,
        preload: 'auto',
        responsive: true,
        fluid: true
      });
  
      this.player.src({
        src: this.videoSrc,
        type: 'video/mp4'
      });
    },
    beforeDestroy() {
      if (this.player) {
        this.player.dispose();
      }
    }
  };
  </script>
  
  <style scoped>
  .background-video-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  
  .video-js {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }
  
  .content {
    position: relative;
    z-index: 1;
    color: white;
    text-align: center;
    padding: 20px;
  }
  </style>
  