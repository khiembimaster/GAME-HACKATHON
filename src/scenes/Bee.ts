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
    private path !: Phaser.Curves.Path
    private x
    private health
	constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, peguin: Phaser.Physics.Matter.Sprite)
	{
		this.scene = scene
		this.sprite = sprite
		this.peguin = peguin
		this.x = sprite.x
		this.health = 1
		this.createAnimations()
        this.sprite.setIgnoreGravity(true);
		this.stateMachine = new StateMachine(this, 'bee')
        
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
		.addState('shoot', {
			onEnter: this.BeeShootEnter,
			onUpdate: this.BeeShoot
		})
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

	destroy()
	{
		events.off('snowman-stomped', this.handleStomped, this)
	}

	update(dt: number)
	{   console.log(this.moveTime)
		this.stateMachine.update(dt)
	}
    
    private DownLeftEnter(){
	    
        this.sprite.play('move-left')
	}
    
    private DownLeftDrop(){
		this.sprite.setVelocityX(0);
		this.sprite.setVelocityY(5)
		this.scene.time.delayedCall(1000, () => {
			this.scene.tweens.add({
			targets: this.sprite,
			onComplete: () => {
				this.moveTime = 0;
				this.sprite.setVelocity(0, -5)
			    this.stateMachine.setState('move-right')		 
			}
		})})
		
	}
    
    private DownRightEnter(){
	    
        this.sprite.play('move-right')
	}
    
    private DownRightDrop(){
		this.sprite.setVelocityX(0);
		this.sprite.setVelocityY(5)
		this.scene.time.delayedCall(1000, () => {
			this.scene.tweens.add({
			targets: this.sprite,
			duration: 200,
			onComplete: () => {
				this.moveTime = 0;
				this.sprite.setVelocity(0, -5)
			    this.stateMachine.setState('move-left')		 
			}

		})})
		
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
			frameRate: 100,
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
			frameRate: 50,
			repeat: -1
		})
	}

	private idleOnEnter()
	{		
		this.sprite.play('move-right')
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
	{   this.sprite.setVelocity(0, 0);
		this.moveTime = 0
		this.sprite.play('move-left')
	}

	private moveLeftOnUpdate(dt: number)
	{   this.sprite.setVelocity(0, 0);
		this.moveTime += dt
		this.sprite.setVelocityX(-3)
		if ((this.moveTime > 1000 && this.moveTime < 1020)){
			this.xbeam = this.sprite.x;
			this.ybeam = this.sprite.y + 65;
			this.beam = this.scene.matter.add.sprite(this.xbeam, this.ybeam, 'bee');
			this.beam.setOnCollide((data: MatterJS.ICollisionPair) => {
				this.beam.destroy()
			})
			this.beam.setVelocity(2, 3)
		}
		if (this.moveTime > 2000)
		   {
			this.stateMachine.setState('run-down-left')
		   }
	    
    }


	private moveRightOnEnter()
	{   this.sprite.setVelocity(0, 0);
		this.moveTime = 0
		this.sprite.play('move-right')
	}

	private moveRightOnUpdate(dt: number)
	{   this.sprite.setVelocity(0, 0);
		this.moveTime += dt
		this.sprite.setVelocityX(3)
		if (this.moveTime > 1000 && this.moveTime < 1020){
		this.xbeam = this.sprite.x;
		this.ybeam = this.sprite.y + 65;
		this.beam = this.scene.matter.add.sprite(this.xbeam, this.ybeam, 'bee');
		this.beam.setOnCollide((data: MatterJS.ICollisionPair) => {
			this.beam.destroy()
		})
		this.beam.setVelocity(2, 3)
	    }
		else{
		if (this.moveTime > 2000)
		   {
			this.stateMachine.setState('run-down-right')
		   }
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
			yoyo: true,
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
    
     /////////////////////////////////
    private BeeShootEnter(){
		this.xbeam = this.sprite.x;
		this.ybeam = this.sprite.y + 64;
		this.beam = this.scene.matter.add.sprite(this.xbeam, this.ybeam, 'bee');
	}

	private BeeShoot(){
		this.beam.setVelocity(2, 3)

		if (this.beam){
		if(this.beam.x - this.sprite.x > 200 || this.beam.y - this.sprite.y > 200 ||   this.sprite.x - this.beam.x > 200 || this.sprite.y - this.beam.y > 200)
		this.scene.tweens.add({
			targets: this.beam,
			duration: 1000,
			onComplete: () => {
				this.beam.destroy()
			},
		})
	}
        let random = Phaser.Math.Between(1, 2);
		if(random = 1)this.stateMachine.setState('move-left');
		else this.stateMachine.setState('move-right')
	}
}

