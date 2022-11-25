import { Scene } from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import { sharedInstance as events } from './EventCenter'



export class BeeControl
{
	private scene: Phaser.Scene
	private sprite: Phaser.Physics.Matter.Sprite
	private stateMachine: StateMachine
	private moveTime = 0
	private xbeam = 0
	private ybeam = 0
	private peguin: Phaser.Physics.Matter.Sprite
	private beam !: Phaser.Physics.Matter.Sprite
	constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, peguin: Phaser.Physics.Matter.Sprite)
	{
		this.scene = scene
		this.sprite = sprite
		this.peguin = peguin
		this.createAnimations()
        this.sprite.setIgnoreGravity(true);
		this.stateMachine = new StateMachine(this, 'bee')

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
		.addState('shoot', {
			onEnter: this.BeeShootEnter,
			onUpdate: this.BeeShoot
		})
		.setState('idle')
         
		events.on('bee-stomped', this.handleStomped, this)
	}

	destroy()
	{
		events.off('bee-stomped', this.handleStomped, this)
	}

	update(dt: number)
	{
		this.stateMachine.update(dt)
	}

	private createAnimations()
	{
		this.sprite.anims.create({
			key: 'idle',
			frames: [{ key: 'bee', frame: 'bee_left_1.png' }]
		})

		this.sprite.anims.create({
			key: 'move-left',
			frames: this.sprite.anims.generateFrameNames('bee', {
				start: 1,
				end: 4,
				prefix: 'bee_left_',
				suffix: '.png'
			}),
			frameRate: 10,
			repeat: -1
		})

		this.sprite.anims.create({
			key: 'move-right',
			frames: this.sprite.anims.generateFrameNames('bee', {
				start: 1,
				end: 4,
				prefix: 'bee_left_',
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
			this.stateMachine.setState('shoot')
		}
	}

	private handleStomped(bee: Phaser.Physics.Matter.Sprite)
	{
		if (this.sprite !== bee)
		{
			return
		}

		events.off('bee-stomped', this.handleStomped, this)

		this.scene.tweens.add({
			targets: this.sprite,
			displayHeight: 0,
			y: this.sprite.y + (this.sprite.displayHeight * 0.5),
			duration: 200,
			onComplete: () => {
				this.sprite.destroy()
			}
		})
		this.stateMachine.setState('dead')
	}
    

    private BeeShootEnter(){
		this.xbeam = this.sprite.x;
		this.ybeam = this.sprite.y + 64;
		this.beam = this.scene.matter.add.sprite(this.xbeam, this.ybeam, 'bee');
	}

	private BeeShoot(){
		this.beam.setVelocity(2, 3)

		if (this.beam){
		if(this.beam.x - this.sprite.x > 5 || this.beam.y - this.sprite.y > 5 ||   this.sprite.x - this.beam.x > 5 || this.sprite.y - this.beam.y > 5)
		this.scene.tweens.add({
			targets: this.beam,
			displayHeight: 0,
			onComplete: () => {
				this.beam.destroy()
			}
		})
	}
        let random = Phaser.Math.Between(1, 2);
		if(random = 1)this.stateMachine.setState('move-left');
		else this.stateMachine.setState('move-right')
	}
}

