import Phaser from 'phaser'

export default class PopUp extends Phaser.Scene{
    constructor(){
        super('popUp')
    }

    preload() {
        this.load.image('x', 'images/grey_boxCross.png')
        this.load.image('box', 'image/grey_panel.png')
    }

    create() {
        this.add.image(240, 160, 'box').setOrigin(0)
        this.add.image(450, 70, 'x').setOrigin(0).setInteractive()
        this.add.text(250, 170, 'Hello World', {fontSize: '32px'})
    }
}