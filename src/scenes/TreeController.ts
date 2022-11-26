import StateMachine from '../statemachine/StateMachine'
import { sharedInstance as events } from './EventCenter'

export default class TreeController {
    private water: number = 1
    private scene: Phaser.Scene
    private sprite: Phaser.Physics.Matter.Sprite
    private timer!: Phaser.Time.TimerEvent

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.scene = scene
        this.sprite = sprite

        this.createAnimations()
        events.on('waterTree', this.enterTreeGrow, this)
    }

    private enterTreeGrow(value: number) {
        this.water += value * 0.5

        this.sprite.anims.play('tree-grow', true)
        this.sprite.setScale(1, this.water)

        // console.log(value)   
        // if(this.water > 3){

        // }
    }

    createAnimations() {
        this.sprite.anims.create({
            key: 'tree-growth',
            frameRate: 1,
            frames: this.sprite.anims.generateFrameNames('tree', {
                start: 1,
                end: 5,
                prefix: 'tree-',
                suffix: '.png'
            }),
            repeat: 1
        })
    }
}