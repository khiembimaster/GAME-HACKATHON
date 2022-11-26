import StateMachine from '../statemachine/StateMachine'
import { sharedInstance as events } from './EventCenter'

export default class TreeController {
    private water: number = 0
    private scene: Phaser.Scene
    private image: Phaser.Physics.Matter.Image
    private stateMachine: StateMachine
    private timer!: Phaser.Time.TimerEvent

    constructor(scene: Phaser.Scene, image: Phaser.Physics.Matter.Image) {
        this.scene = scene
        this.image = image

        this.stateMachine = new StateMachine(this, 'tree')

        this.stateMachine.addState('grow', {
            onEnter: this.enterTreeGrow,
        })
            .addState('idle', {
                onEnter: this.enterTreeIdle,
            })

        this.stateMachine.setState('idle')

        events.on('waterTree', this.enterTreeGrow, this)
    }

    update(dt: number) {
        this.stateMachine.update(dt)
    }

    private enterTreeGrow() {
        this.water += 1
        this.exitTreeIdle()
        this.image.setScale(this.water / 10)

        this.stateMachine.setState('idle')
    }

    private enterTreeIdle() {
        this.timer = this.scene.time.addEvent({
            delay: 10000,
            callback: () => {
                this.water -= 1
                this.image.setScale(this.water / 10)
            }
        })
    }

    private exitTreeIdle() {
        this.timer.remove()
    }
}