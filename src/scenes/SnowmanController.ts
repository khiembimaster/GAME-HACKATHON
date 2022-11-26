import StateMachine from '../statemachine/StateMachine'
import { sharedInstance as events } from './EventCenter'

export default class SnowmanController
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

		this.stateMachine = new StateMachine(this, 'XLow')

		this.stateMachine.addState('idle', {
			onEnter: this.idleOnEnter
		})
		.addState('move-left', {
			onEnter: this.moveLeftOnEnter,
			onUpdate: this.moveLeftOnUpdate
		})
		.addState('move-right', {
			onEnter: this.moveRightOnEnter,
			onUpdate: this.moveRightOnUpdate
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
		this.stateMachine.update(dt)
	}

	private createAnimations()
	{
		this.sprite.anims.create({
			key: 'idle',
			frames: [{ key: 'XLow', frame: 'snowman_left_1.png' }]
		})

		this.sprite.anims.create({
			key: 'move-left',
			frames: this.sprite.anims.generateFrameNames('XLow', {
				start: 1,
				end: 2,
				prefix: 'snowman_left_',
				suffix: '.png'
			}),
			frameRate: 5,
			repeat: -1
		})

		this.sprite.anims.create({
			key: 'move-right',
			frames: this.sprite.anims.generateFrameNames('XLow', {
				start: 1,
				end: 2,
				prefix: 'snowman_right_',
				suffix: '.png'
			}),
			frameRate: 5,
			repeat: -1
		})
	}

	private idleOnEnter()
	{
		this.sprite.play('idle')
		const r = Phaser.Math.Between(1, 100)
		if (r < 50)
		{
			this.stateMachine.setState('move-left')
		}
		else
		{
			this.stateMachine.setState('move-right')
		}
	}

	private moveLeftOnEnter()
	{
		this.moveTime = 0
		this.sprite.play('move-left')
	}

	private moveLeftOnUpdate(dt: number)
	{
		this.moveTime += dt
		this.sprite.setVelocityX(-3)

		if (this.moveTime > 2000)
		{
			this.stateMachine.setState('move-right')
		}
	}

	private moveRightOnEnter()
	{
		this.moveTime = 0
		this.sprite.play('move-right')
	}

	private moveRightOnUpdate(dt: number) 
	{
		this.moveTime += dt
		this.sprite.setVelocityX(3)

		if (this.moveTime > 2000)
		{
			this.stateMachine.setState('move-left')
		}
	}

	private handleStomped(snowman: Phaser.Physics.Matter.Sprite)
	{
		if (this.sprite !== snowman)
		{
			return
		}
        else {if (this.health == 0){
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
}
