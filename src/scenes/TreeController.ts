import StateMachine from '../statemachine/StateMachine'
import { sharedInstance as events } from './EventCenter'

export default class TreeController {
    private water: number = 1
    private scene: Phaser.Scene
    private sprite: Phaser.Physics.Matter.Image
    private stateMachine: StateMachine
    private timer!: Phaser.Time.TimerEvent

    constructor(scene: Phaser.Scene, image: Phaser.Physics.Matter.Sprite) {
        this.scene = scene
        this.sprite = image

        this.stateMachine = new StateMachine(this, 'tree')

        this.stateMachine.addState('idle', {
                onEnter: this.enterTreeIdle,
            })

        this.stateMachine.setState('idle')

        events.on('waterTree', this.enterTreeGrow, this)
    }

    update(dt: number) {
        this.stateMachine.update(dt)
    }

    private enterTreeGrow(value: number) {
        this.timer.remove()
        this.water += value * 0.2
        this.sprite.setScale(this.water)

        this.stateMachine.setState('idle')
    }

    private enterTreeIdle() {
        this.timer = this.scene.time.addEvent({
            delay: 100000,
            callback: () => {
                this.water -= 1
                this.sprite.setScale(this.water)
            }
        })
    }
}