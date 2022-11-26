var textConfig = {
    fontFamily: 'Comic Sans MS',
    fontSize: '15px',
    fill: '#000000',
    align: 'center',
    wordWrap: {
        width: 500
    },
    resolution: 3
}

export default class PopUp extends Phaser.Scene {
    message
    preScene

    constructor() {
        super({ key: 'popUp' });
    }

    init(data) {
        this.message = data.message;
        this.preScene = data.scene;
    }

    preload() {
		this.load.image('x', 'assets/image/grey_panel.png')
        this.load.image('box', 'assets/image/grey_boxCross.png')
    }

    create() {
        let screenW = this.sys.game.config.width;
        let screenH = this.sys.game.config.height;

        // @ts-ignore
        var container = this.add.container(screenW / 2, screenH / 2 - 150);

        container.add(this.add.image(0, 0, 'box').setScale(5, 1.5));
        container.add(this.add.image(0, 0, 'x'));
        container.add(this.add.text(0, 0, this.message, textConfig));
        Phaser.Display.Align.In.Center(container.getAt(2), container.getAt(0));
        Phaser.Display.Align.In.TopRight(container.getAt(1), container.getAt(0), 200, 30);
        container.setInteractive(
            //@ts-ignore
            new Phaser.Geom.Rectangle(-screenW / 2, -screenH / 2, screenW, screenH),
            Phaser.Geom.Rectangle.Contains
        )

        container.addListener('pointerdown', () => {
            this.scene.resume(this.preScene);
            this.scene.stop();
        });
        
        container.scene.time.delayedCall(5000, () => {
            this.scene.resume(this.preScene);
            this.scene.stop();
        });
    }
    update() { };
}