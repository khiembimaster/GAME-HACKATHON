import StateMachine from '../statemachine/StateMachine'
import { sharedInstance as events } from './EventCenter'

export default class UpYControl
{   public health
	private scene: Phaser.Scene
	private sprite: Phaser.Physics.Matter.Sprite
	private stateMachine: StateMachine

	private moveTime = 0

	constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite)
	{   
		this.health = 1;
		this.scene = scene
		this.sprite = sprite

		this.createAnimations()

		this.stateMachine = new StateMachine(this, 'Y')

		this.stateMachine.addState('idle', {
			onEnter: this.idleOnEnter
		})
		.addState('jump', {
            onEnter: this.JumponEnter,
            onUpdate : this.JumponUpdate
        })
		.addState('dead')
		.setState('idle')

		events.on('snowman-stomped', this.handleStomped, this)
	}

	destroy()
	{
		events.off('snowman-stomped', this.handleStomped, this)
	}

	update(dt: number)
	{   
        console.log(this.moveTime)
		this.stateMachine.update(dt)
	}

	private createAnimations()
	{
		this.sprite.anims.create({
			key: 'idle',
			frames: [{ key: 'Y', frame: 'snowman_left_1.png' }]
		})
        this.sprite.anims.create({
            key : 'jump',
            frames: [{key: 'Y, frame: snowman_left_1.png'}]
        })

	}

	private idleOnEnter()
	{
		this.sprite.play('idle')
        this.scene.time.delayedCall(1000, () => {
            this.stateMachine.setState('jump')
        })
		
	}
    
    private JumponEnter(){
        this.moveTime = 0;
    }
    
    private JumponUpdate(dt : number){
        this.moveTime += dt;
        this.sprite.setVelocityY(-20);
        if (this.moveTime > 1000){
            this.sprite.setVelocityY(20);
            this.stateMachine.setState('idle')
        }
    }

	private handleStomped(snowman: Phaser.Physics.Matter.Sprite)
	{
		if (this.sprite !== snowman)
		{
			return
		}
        if (this.health == 0){
		events.off('snowman-stomped', this.handleStomped, this)
		this.scene.tweens.add({
			targets: this.sprite,
			displayHeight: -100,
			y: this.sprite.y + (this.sprite.displayHeight * 0.5),
			duration: 200,
			onComplete: () => {
				this.sprite.destroy()
			}
		})
		this.stateMachine.setState('dead')
	    }
		else{
			this.health--;
			return;
		}
	}
}
