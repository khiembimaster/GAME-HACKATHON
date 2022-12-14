import Phaser from 'phaser'
import { sharedInstance as events } from './EventCenter'

export default class UI extends Phaser.Scene
{
	private starsLabel!: Phaser.GameObjects.Text
	private starsCollected = 0
	private graphics!: Phaser.GameObjects.Graphics

	private lastHealth = 100

	constructor()
	{
		super({
			key: 'ui'
		})
	}

	init()
	{
		this.starsCollected = 0
	}

	preload() {
        this.load.image('box', 'assets/image/grey_boxCross.png')
	}

	create()
	{
		this.add.image(0, 5, 'box').setOrigin(0,0).setScale(2.2, 0.6)
		
		this.graphics = this.add.graphics()
		this.setHealthBar(100)

		this.starsLabel = this.add.text(10, 33, 'Sun: 0', {
			fontSize: '32px',
			fill: '#000'
		})

		events.on('star-collected', this.handleStarCollected, this)
		events.on('health-changed', this.handleHealthChanged, this)
		

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			events.off('star-collected', this.handleStarCollected, this)
		})
	}

	private setHealthBar(value: number)
	{
		const width = 200
		const percent = Phaser.Math.Clamp(value, 0, 100) / 100

		this.graphics.clear()
		this.graphics.fillStyle(0x808080)
		this.graphics.fillRoundedRect(10, 10, width, 20, 5)
		if (percent > 0)
		{
			this.graphics.fillStyle(0x00ff00)
			this.graphics.fillRoundedRect(10, 10, width * percent, 20, 5)
		}
	}

	private handleHealthChanged(value: number)
	{
		this.tweens.addCounter({
			from: this.lastHealth,
			to: value,
			duration: 200,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: tween => {
				const value = tween.getValue()
				this.setHealthBar(value)
			}
		})

		this.lastHealth = value
	}

	private handleStarCollected(value: number)
	{
		this.starsCollected = value
		this.starsLabel.text = `Sun: ${this.starsCollected}`
	}
}
