var Game = function() {

    this.height = 600;
    this.width = 800;

    this.pipeWidth = 200;
    this.spaceBetweenPipes = 400;
    this.pipeOffset = 800;

    var game = this;

    var frameRate = 1/40; // Seconds
    var Cd = 0.47; // Dimensionless
    var rho = 1.22; // kg / m^3
    var A = 5000 / (10000);
    var ag = 9.81;

    var gameSpeed = 10;
    var boardCurrentX = 0;
    var currentPipeI = 0;
    var pipes = [];

    var $boardStartCalc = false;
    var $boardNorm = 0;

    this.airplaneImg = new Image();
    this.airplane = null;

    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {
        backgroundColor : 0xFFFFFF
    });
    this.stage = new PIXI.Container();

    this._blockGravity = true;

    var keyboard = function(keyCode) {
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        key.upHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    };

    this.initAirplane = function(){
        var baseTexture = new PIXI.BaseTexture(this.airplaneImg);
        var texture = new PIXI.Texture(baseTexture);
        this.airplane = new PIXI.Sprite(texture);

        // center the sprite's anchor point
        this.airplane.anchor.x = 0;
        this.airplane.anchor.y = 0;
        this.airplane.position.x = 200;
        this.airplane.position.y = this.height/2 - 100;

        this.airplane.velocity = {x: 10, y: 0};
        this.airplane.mass = 0.05; //kg
        this.airplane.restitution = -0.7;

        this.stage.addChild(this.airplane);
    };

    this.isGravityLocked = function () {
        return this._blockGravity;
    };

    this.lockGravity = function () {
        this._blockGravity = true;
    };

    this.unlockGravity = function (time) {
        time = time || 0;

        setTimeout(function ()
        {
            game._blockGravity = false;
        }, time);
    };

    this.changeYPosSmothly = function (time, y, radius) {

        var steps = Math.round(time * 30 / 1000);
        var yStep = y / steps;
        var rStep = radius / steps;
        var i = 0;

        game.airplane.rotation += radius;

        var $i = setInterval(function () {
            if (i >= steps) {
                game.airplane.rotation = 0;
                clearInterval($i);
            }

            game.airplane.position.y += yStep;
            game.airplane.rotation -= rStep;
            i++;
        }, 30);
    };

    this.initKeyboard = function() {
        var left = keyboard(37),
            up = keyboard(38),
            right = keyboard(39),
            down = keyboard(40);

        up.press = function () {
            game.changeYPosSmothly(100, -50, -0.1);
            game.lockGravity();
            game.unlockGravity(100);
        };

        down.press = function () {
            game.changeYPosSmothly(150, 50, 0.1);
            game.lockGravity();
            game.unlockGravity(100);
        };
    };

    this.stop = function () {
        this.lockGravity();

        this.stage.removeChild(this.$graphics);
        this.$graphics = new PIXI.Graphics();
        this.$graphics.beginFill(0xFFFFFF);
        this.$graphics.drawRect(0, 0, this.width, this.height);
        this.stage.addChild(this.$graphics);

        var style = {
            fontFamily : 'Arial',
            fontSize: '36px',
            fontWeight: 'bold',
            fill : '#F7EDCA',
            stroke : '#4a1850',
            strokeThickness : 5,
            dropShadow : true,
            dropShadowColor : '#000000',
            dropShadowAngle : Math.PI / 6,
            dropShadowDistance : 6,
            wordWrap : true,
            wordWrapWidth : 440
        };

        var richText = new PIXI.Text('GAME OVER', style);
        richText.x = this.width/2 - richText.width/2;
        richText.y = 200;
        this.stage.addChild(richText);

        var basicText = new PIXI.Text('Zaliczone rury: '+ (currentPipeI) +'. Gratulacje!');
        basicText.x = this.width/2 - basicText.width/2;
        basicText.y = 250;
        this.stage.addChild(basicText);

        var basicText2 = new PIXI.Text('Jeszcze raz?');
        basicText2.x = this.width/2 - basicText2.width/2;
        basicText2.y = 350;
        basicText2.interactive = true;
        basicText2.on('mousedown', function () {
            game.stage.removeChild(game.$graphics);
            game.stage.removeChild(richText);
            game.stage.removeChild(basicText);
            game.stage.removeChild(basicText2);
            game.reset();
            game.start();
        });
        this.stage.addChild(basicText2);

        this.renderer.render(game.stage);
    };

    this.drawStartBtn = function () {
        var style = {
            fontFamily : 'Arial',
            fontSize: '36px',
            fontWeight: 'bold',
            fill : '#F7EDCA',
            stroke : '#4a1850',
            strokeThickness : 5,
            dropShadow : true,
            dropShadowColor : '#000000',
            dropShadowAngle : Math.PI / 6,
            dropShadowDistance : 6,
            wordWrap : true,
            wordWrapWidth : 440
        };

        var basicText = new PIXI.Text('Witaj! Sterujesz strzałką do góry i strzałką w dół. Gotowy?');
        basicText.x = this.width/2 - basicText.width/2;
        basicText.y = 200;
        this.stage.addChild(basicText);

        var richText = new PIXI.Text('START', style);
        richText.x = this.width/2 - richText.width/2;
        richText.y = 250;

        richText.interactive = true;
        richText.on('mousedown', function () {
            game.stage.removeChild(basicText);
            game.stage.removeChild(richText);
            game.start();
        });

        this.stage.addChild(richText);
        this.renderer.render(game.stage);
    };

    this.start = function () {

        if (this.airplane) {
            this.airplane.position.y = this.height/2 - 100;
        } else {
            this.initAirplane();
        }

        setTimeout(function () {
            game.generatePipes();
            game.unlockGravity(0);
            game.update();
        }, 50);
    };

    this.calcPipeX = function (pipeIndex) {
        return pipeIndex * (this.spaceBetweenPipes + this.pipeWidth) + this.pipeOffset - boardCurrentX;
    };

    this.drawPipes = function () {
        this.stage.removeChild(this.$graphics);

        boardCurrentX += gameSpeed;

        if ($boardStartCalc) {
            if ($boardNorm >= (this.pipeWidth + this.spaceBetweenPipes)) {
                $boardNorm = 0;
                currentPipeI++;
            }

            $boardNorm += gameSpeed;

        } else {
            $boardStartCalc = boardCurrentX >= (this.pipeOffset - this.airplane.position.x - this.airplane.width);
        }

        this.$graphics = new PIXI.Graphics();

        for (var i = 0; i < 10; i++) {
            var pipeIndex = i + currentPipeI;
            var pipe = pipes[pipeIndex];

            this.$graphics.beginFill(0xFFFFFF);
            this.$graphics.lineStyle(4, 0x000000, 1);

            var x1 = this.calcPipeX(pipeIndex);
            this.$graphics.drawRect(x1, -5, this.pipeWidth, pipe.y1);
            this.$graphics.drawRect(x1, pipe.y2, this.pipeWidth, this.height);
        }

//            this.$graphics.moveTo(this.airplane.position.x, this.airplane.position.y);
//            this.$graphics.lineTo(this.airplane.position.x + this.airplane.width, this.airplane.position.y + this.airplane.height/1.5);
//            this.$graphics.lineTo(this.airplane.position.x, this.airplane.position.y + this.airplane.height);

        this.stage.addChild(this.$graphics);
    };

    this.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    this.generatePipes = function () {
        var minH = this.airplane.height || 100;

        for (var i = 0; i < 1000; i++) {
            var $minH = this.getRandomInt(minH*2.5, minH*3.5);
            var y1 = this.getRandomInt(0, this.height - $minH);
            var y2 = this.getRandomInt(y1+$minH, this.height);

            pipes.push({
                y1: y1,
                y2: y2
            });
        }
    };

    this.reset = function () {
        boardCurrentX = 0;
        currentPipeI = 0;
        pipes = [];
        $boardStartCalc = false;
        $boardNorm = 0;

        this._blockGravity = true;
    };

    this.init = function() {
        this.reset();
        this.initKeyboard();
        this.drawStartBtn();

        document.body.appendChild(this.renderer.view);
    };

    this.getXPos = function () {
        return game.airplane.position.x;

        var Fx = -0.5 * Cd * A * rho * game.airplane.velocity.x * game.airplane.velocity.x * game.airplane.velocity.x / Math.abs(game.airplane.velocity.x);
        Fx = (isNaN(Fx) ? 0 : Fx);

        //( F = ma )
        var ax = Fx / game.airplane.mass;
        game.airplane.velocity.x += ax*frameRate;

        return game.airplane.position.x + game.airplane.velocity.x * frameRate * 100;
    };

    this.getYPos = function () {
        if (game.isGravityLocked()) return game.airplane.position.y;

        var Fy = -0.5 * Cd * A * rho * game.airplane.velocity.y * game.airplane.velocity.y * game.airplane.velocity.y / Math.abs(game.airplane.velocity.y);
        Fy = (isNaN(Fy) ? 0 : Fy);

        //( F = ma )
        var ay = ag + (Fy / game.airplane.mass);
        game.airplane.velocity.y += ay*frameRate;

        return game.airplane.position.y + game.airplane.velocity.y * frameRate * 100;
    };

    this.hasBeyondBorders = function () {
        var maxY = this.airplane.height + this.airplane.position.y;

        return 0 >= this.airplane.position.y || this.height <= maxY;
    };

    this.hasCollisionWithTopPipe = function (aX2, pX1, aY1, pipeY1) {
        var rX = aX2 - pX1;

        var aY;

        if (rX > this.airplane.width) {
            aY = aY1;
        } else {
            var hH = this.airplane.height / 2;
            var b = rX * hH / this.airplane.width;
            aY = aY1 + hH - b;
        }

        return pipeY1 > aY;
    };

    this.hasCollisionWithBottomPipe = function (aX2, pX1, aY1, aY2, pipeY2) {
        var rX = aX2 - pX1;

        var aY;

        if (rX > this.airplane.width) {
            aY = aY2;
        } else {
            var hH = this.airplane.height / 2;
            var b = rX * hH / this.airplane.width;
            aY = aY1 + hH + b;
        }

        return pipeY2 < aY;
    };

    this.hasCollisionWithPipe = function () {

        var aPosX = this.airplane.position.x;
        var aPosY = this.airplane.position.y;
        var aX1 = aPosX;
        var aX2 = aPosX + this.airplane.width;
        var aY1 = aPosY;
        var aY2 = aPosY + this.airplane.height;

        var pipeX1 = this.calcPipeX(currentPipeI);
        var pipeX2 = pipeX1 + this.pipeWidth;
        var pipeYs = pipes[currentPipeI];

        return (pipeX1 <= aX2 && aX1 <= pipeX2) && (this.hasCollisionWithTopPipe(aX2, pipeX1, aY1, pipeYs.y1) || this.hasCollisionWithBottomPipe(aX2, pipeX1, aY1, aY2, pipeYs.y2)); //(pipeYs.y1 > aY1 || pipeYs.y2 < aY2);
    };

    this.update = function() {
        if (game.hasBeyondBorders() || game.hasCollisionWithPipe()) {
            game.stop();
            return;
        }

        requestAnimationFrame(game.update);

        game.drawPipes();

        game.airplane.position.y = game.getYPos();
        game.airplane.position.x = game.getXPos();

        game.renderer.render(game.stage);
    };
};

var g = new Game();
g.airplaneImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALwAAABGCAYAAAB2QP7UAAAACXBIWXMAAAsTAAALEwEAmpwYAAA4LWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzIgNzkuMTU5Mjg0LCAyMDE2LzA0LzE5LTEzOjEzOjQwICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChNYWNpbnRvc2gpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDE2LTA5LTE5VDE0OjA0OjM5KzAyOjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMTYtMDktMTlUMTc6NDA6NTcrMDI6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDE2LTA5LTE5VDE3OjQwOjU3KzAyOjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjVhZDE0NzBlLTcyZDQtNDAxNi1hNTkzLTI1YTI2ODdjMThjNTwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDo1YWQxNDcwZS03MmQ0LTQwMTYtYTU5My0yNWEyNjg3YzE4YzU8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDo1YWQxNDcwZS03MmQ0LTQwMTYtYTU5My0yNWEyNjg3YzE4YzU8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6NWFkMTQ3MGUtNzJkNC00MDE2LWE1OTMtMjVhMjY4N2MxOGM1PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE2LTA5LTE5VDE0OjA0OjM5KzAyOjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChNYWNpbnRvc2gpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6U2VxPgogICAgICAgICA8L3htcE1NOkhpc3Rvcnk+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOllSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4yPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8ZXhpZjpDb2xvclNwYWNlPjY1NTM1PC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xODg8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+NzA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAg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';
g.airplaneImg.width = 188;
g.airplaneImg.height = 70;
g.init();