<template>
    <div class="bar-wrap">
        <div class="bar" :style="{'height': (height + 1) + 'px'}"></div>
    </div>
</template>

<script>
    export default {
        name: 'bar',
        props: {
            height: Number,
            
        },
        data() {
            return {

            }
        },
    }
</script>

<style>
    .bar-wrap {
        position: absolute;
        width: 5px;
        margin: 2px;
        display: inline-block;
    }
    .bar {
        width: 5px;
        background: white;
        position: absolute;
        margin: auto;
        top: 0; left: 0; bottom: 0; right: 0;
        border-radius: 1px;
    }
</style>
