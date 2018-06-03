cc.Class({
    extends: cc.Component,

    properties: {
        btn_up: {
            default: null,
            type: cc.Button
        },
        btn_down: {
            default: null,
            type: cc.Button
        },
        btn_left: {
            default: null,
            type: cc.Button
        },
        btn_right: {
            default: null,
            type: cc.Button
        },
        btn_press: {
            default: null,
            type: cc.Button
        },

        socket: {}
        // defaults, set visually when attaching this script to the Canvas
    },

    getMoveInfo: function(direction){
        var param = {"direction" : direction};
        console.log(param)
        return JSON.stringify(param);
    },

    // use this for initialization
    up: function(socket){
        console.log('向上移动 ' + socket.id)
        let self = this
        self.socket.emit('handplay', self.getMoveInfo("up"));
    },
    down: function(socket){
        console.log('向下移动 ' + socket.id)
        let self = this
        self.socket.emit('handplay', self.getMoveInfo("down"));

    },
    left: function(socket){
        console.log('向左移动 ' + socket.id)
        let self = this
        self.socket.emit('handplay', self.getMoveInfo("left"));

    },
    right: function(socket){
        console.log('向右移动 ' + socket.id)
        let self = this
        self.socket.emit('handplay', self.getMoveInfo("right"));

    },
    press: function(socket){
        console.log('发射 ' + socket.id)
        let self = this
        self.socket.emit('handplay', self.getMoveInfo("press")); 
    },
    
    onLoad: function () {
        if (cc.sys.isNative) {
            console.log('本地socket');
            window.io = SocketIO;
        } else {
            console.log('不是本地socket');
            window.io = require('socket.io');
        }
        let self = this
        var sc = window.io('http://localhost:9999');
        self.socket=sc;
        console.log('链接上了 ' + self.socket.id + " # " + sc.id)
        self.socket.on('football', (msg) => {
            console.log('足球的反馈')
        })
        
        self.socket.on('connected', (msg) => {
            console.log('接收到发送事件 ' + msg)
        })
    },

    // called every frame
    update: function (dt) {

    },
});