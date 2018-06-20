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

        power_bar: {
            default: null,
            type: cc.ProgressBar
        },

        btn_quit: {
            default: null,
            type: cc.Button
        },

        dialog:{
            default: null,
            type: cc.Layout
        },

        btn_quitgame:{
            default: null,
            type: cc.Button
        },

        btn_continuegame:{
            default: null,
            type: cc.Button
        },

        // 能否点击射球，如果已经点击了，那么就不能射门了，要等这次射门完成
        canPressShoot: true,
        isStartPress: false,
        pressPower: 0,
        isPressing: false,
        pressStart: 0,
        pressEnd: 0,
        maxPressDuration: 1000,

        socket: {}
        // defaults, set visually when attaching this script to the Canvas
    },

    getMoveInfo: function (direction) {
        var param = {
            "direction": direction,
            "power": this.pressPower
        };
        console.log(param)
        return JSON.stringify(param);
    },

    // use this for initialization
    up: function (socket) {
        let self = this
        if (!self.canPressShoot) {
            return
        }
        console.log('向上移动 ' + socket.id)
        self.socket.emit('handplay', self.getMoveInfo("up"));
    },
    down: function (socket) {
        let self = this
        if (!self.canPressShoot) {
            return
        }
        console.log('向下移动 ' + socket.id)
        self.socket.emit('handplay', self.getMoveInfo("down"));

    },
    left: function (socket) {

        let self = this
        if (!self.canPressShoot) {
            return
        }
        console.log('向左移动 ' + socket.id)
        // self.socket.emit('handplay', self.getMoveInfo("left"));
        self.moveLeft();
    },
    right: function (socket) {
        let self = this
        if (!self.canPressShoot) {
            return
        }
        console.log('向右移动 ' + socket.id)
        // self.socket.emit('handplay', self.getMoveInfo("right"));
        self.moveRight();
    },

    // 显示推出
    quit: function(){
        let self = this;
        self.showDialog();
    },

    quitgame: function(){
        let self = this;
        self.hideDialog();
        // 退出游戏
    },

    continuegame: function(){
        let self = this;
        self.hideDialog();
    },


    moveLeft: function(){
        let self = this;
        G.roomsocket.emit('control', self.getMoveInfo("left"));
    },

    moveRight: function(){
        let self = this;
        G.roomsocket.emit('control', self.getMoveInfo("right"));
    },

    emitShoot: function () {
        let self = this;
        self.socket.emit('handplay', self.getMoveInfo("press"));
        // 给房间发送通知
        G.roomsocket.emit('control', self.getMoveInfo("press"));
        self.isStartPress = false;
        // 设计完成，让下次不能再射击
        self.canPressShoot = false;
        self.hidePowerBar();
        // 计时3秒后才能点击
        self.schedule(function () {
            self.canPressShoot = true;
        }, 3, 0);
    },

    press: function (socket) {
        let self = this
        self.btn_press.node.on('touchstart', function (event) {
            if (!self.canPressShoot) {
                return
            }
            self.showPowerBar();
            self.isStartPress = true;
            self.isPressing = true;
            self.pressStart = Date.now;
            console.log('开始点击:  ' + self.pressStart)
        })
        self.btn_press.node.on('touchend', function (event) {
            if (!self.canPressShoot) {
                return
            }
            self.isPressing = false;
            self.pressEnd = Date.now;
            if (self.isStartPress) {
                console.log('结束点击: ' + self.pressEnd);
                self.emitShoot();

            }
        })

    },

    hidePowerBar: function () {
        let self = this;
        self.power_bar.node.active = false;

    },

    showPowerBar: function () {
        let self = this;
        self.power_bar.node.active = true;
    },

    resetPowerBar: function (power) {
        if (power > 1) {
            power = 1;
        }
        if (power < 0) {
            power = 0;
        }
        console.log('能量: ' + power);
        this.power_bar.progress = power;
    },

    setupSocket: function () {
        if (cc.sys.isNative) {
            console.log('本地socket');
            window.io = SocketIO;
        } else {
            console.log('不是本地socket');
            window.io = require('socket.io');
        }
        let self = this
        var sc = window.io('http://localhost:5757');
        self.socket = sc;
        console.log('链接上了 ' + self.socket.id + " # " + sc.id)
        self.socket.on('football', (msg) => {
            console.log('足球的反馈')
        })

        self.socket.on('connected', (msg) => {
            console.log('接收到发送事件 ' + msg)
        })

        self.socket.on('handstatus', (msg) => {
            console.log(msg);
            var obj = JSON.parse(msg);
            switch (obj.shootstatus) {
                case 'end':
                    self.canPressShoot = true;
                    break;
            }
        })

        // 进入房间
        G.roomsocket = io.connect('http://193.112.183.189:5757/rooms11', { 'force new connection': true });

        G.roomsocket.on('shootstart', function (data) {
            console.log(data);
        });

        G.roomsocket.on('shootend', function (data) {
            console.log(data);
        });

        G.roomsocket.on('control', function(data){
            console.log(data);
        })

        G.roomsocket.on('disconnect', function () {

        })
    },

    setupParams: function () {
        let self = this;
        self.hidePowerBar();
    },

    hideDialog: function(){
        let self = this;
        self.btn_quitgame.node.active = false;
        self.btn_continuegame.node.active = false;
        self.dialog.node.active = false;
        
    },

    showDialog: function () {
        let self = this;
        self.btn_quitgame.node.active = true;
        self.btn_continuegame.node.active = true;
        self.dialog.node.active = true;
    },

    setupViews: function(){
        let self = this;
        self.hideDialog();
        console.log(self.dialog)
    },

    onLoad: function () {
        this.setupParams();
        this.setupSocket();
        this.setupViews();
    },

    // called every frame
    update: function (dt) {
        if (this.isPressing) {
            this.pressPower += 0.01;
            if (this.pressPower > 1) {
                this.pressPower = 1;
            }
            this.resetPowerBar(this.pressPower);
        } else {
            this.pressPower = 0;
            this.resetPowerBar(this.pressPower);
        }
    },
});