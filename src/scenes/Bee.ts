import { Scene } from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import { sharedInstance as events } from './EventCenter'



export class BeeControl {
	private scene: Phaser.Scene
	private sprite: Phaser.Physics.Matter.Sprite
	private stateMachine: StateMachine
	private moveTime = 0
	private xbeam = 0
	private ybeam = 0
	private beam !: Phaser.Physics.Matter.Sprite
	private path !: Phaser.Curves.Path
	private health
	private beams

	constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
		this.beams = []
		this.scene = scene
		this.sprite = sprite
		this.health = 1
		this.createAnimations()
		this.sprite.setIgnoreGravity(true);
		this.stateMachine = new StateMachine(this, 'boss')

		//let graphics = scene.add.graphics();

		//  graphics.lineStyle(1, 0xffffff, 1);

		// this.path.draw(graphics, 128);
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
			.addState('run-down-left', {
				onEnter: this.DownLeftEnter,
				onUpdate: this.DownLeftDrop
			})
			.addState('run-down-right', {
				onEnter: this.DownRightEnter,
				onUpdate: this.DownRightDrop
			})
			.setState('idle');
		events.on('snowman-stomped', this.handleStomped, this)
	}

	destroy() {
		events.off('snowman-stomped', this.handleStomped, this)
	}

	update(dt: number) {
		this.stateMachine.update(dt)
	}



	private createAnimations() {
		this.sprite.anims.create({
			key: 'idle',
			frames: [{ key: 'boss', frame: 'bee_left_1.png' }]
		})

		this.sprite.anims.create({
			key: 'move-left',
			frames: this.sprite.anims.generateFrameNames('boss', {
				start: 1,
				end: 4,
				prefix: 'bee_left_',
				suffix: '.png'
			}),
			frameRate: 100,
			repeat: -1
		})

		this.sprite.anims.create({
			key: 'move-right',
			frames: this.sprite.anims.generateFrameNames('boss', {
				start: 1,
				end: 4,
				prefix: 'bee_left_',
				suffix: '.png'
			}),
			frameRate: 50,
			repeat: -1
		})
	}


	private DownLeftEnter() {

		this.sprite.play('move-left')
	}

	private DownLeftDrop() {
		this.sprite.setVelocityX(0);
		this.sprite.setVelocityY(6)
		this.scene.time.delayedCall(1000, () => {
			this.scene.tweens.add({
				targets: this.sprite,
				duration: 300,
				onComplete: () => {
					this.moveTime = 0;
					this.sprite.setVelocity(0, -5)
					this.stateMachine.setState('move-right')
				}
			})
		})

	}

	private DownRightEnter() {

		this.sprite.play('move-right')
	}

	private DownRightDrop() {
		this.sprite.setVelocityX(0);
		this.sprite.setVelocityY(6)
		this.scene.time.delayedCall(1000, () => {
			this.scene.tweens.add({
				targets: this.sprite,
				duration: 300,
				onComplete: () => {
					this.moveTime = 0;
					this.sprite.setVelocity(0, -5)
					//this.sprite.body.velocity.y = -5
					this.stateMachine.setState('move-left')
				}
			})
		})

	}

	private idleOnEnter() {
		this.sprite.play('move-right')
		const r = Phaser.Math.Between(1, 100)
		if (r < 50) {
			this.stateMachine.setState('move-left')
		}
		else {
			this.stateMachine.setState('move-right')
		}
	}

	private moveLeftOnEnter() {
		this.moveTime = 0
		this.sprite.play('move-left')
	}

	private moveLeftOnUpdate(dt: number) {
		this.sprite.setVelocityY(0)
		this.moveTime += dt
		this.sprite.setVelocityX(-3)
		if ((this.moveTime > 1000 && this.moveTime < 1020)) {
			this.xbeam = this.sprite.x;
			this.ybeam = this.sprite.y + 96;
			this.beam = this.scene.matter.add.sprite(this.xbeam, this.ybeam, 'boss');
			this.beam.setIgnoreGravity(false);
			this.beam.setOnCollide((data: MatterJS.ICollisionPair) => {
				this.beam.destroy()
			})
			this.beam.setVelocity(2, 3)
		}
		if (this.moveTime > 2000) {
			this.stateMachine.setState('run-down-left')
		}

	}


	private moveRightOnEnter() {
		this.moveTime = 0
		this.sprite.play('move-right')
	}

	private moveRightOnUpdate(dt: number) {
		this.sprite.setVelocityY(0);
		this.moveTime += dt
		this.sprite.setVelocityX(3)
		if (this.moveTime > 1000 && this.moveTime < 1020) {
			this.xbeam = this.sprite.x;
			this.ybeam = this.sprite.y + 70;
			this.beam = this.scene.matter.add.sprite(this.xbeam, this.ybeam, 'boss');
			this.beam.setOnCollide((data: MatterJS.ICollisionPair) => {
				this.beam.destroy()
			})
			this.beam.setVelocity(2, 3)
		}
		else {
			if (this.moveTime > 2000) {
				this.stateMachine.setState('run-down-right')
			}
		}
	}

	private handleStomped(snowman: Phaser.Physics.Matter.Sprite) {
		if (this.sprite !== snowman) {
			return
		}
		else {
			if (this.health == 0) {
				events.off('snowman-stomped', this.handleStomped, this)
				this.sprite.setVelocity(0, 0);
				this.scene.tweens.add({
					targets: this.sprite,
					displayHeight: -10,
					y: this.sprite.y + (this.sprite.displayHeight * 0.5),
					duration: 200,
					onComplete: () => {
						this.sprite.destroy()
						this.stateMachine.setState('dead')
					}
				})
				this.stateMachine.setState('dead')
			}
			else {
				this.health--;
				return;
			}
		}

	}

	/////////////////////////////////
}
