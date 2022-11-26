import Phaser from 'phaser'
import { BeeControl } from './Bee'
import ObstaclesController from './ObstaclesController'
import PlayerController from './PlayerController'
import SnowmanController from './SnowmanController'
import TreeController from './TreeController'

export default class Game extends Phaser.Scene {
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private penquin!: Phaser.Physics.Matter.Sprite
	private playerController?: PlayerController
	private obstacles!: ObstaclesController
	private snowmen: SnowmanController[] = []
	private bees: BeeControl[] = []
	private tree: TreeController[] = []
	attack!: Phaser.Input.Keyboard.Key

	constructor() {
		super('game')
	}

	init() {
		this.cursors = this.input.keyboard.createCursorKeys()
		this.attack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
		this.obstacles = new ObstaclesController()
		this.snowmen = []
		this.bees = []
		this.tree = []

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.destroy()
		})
	}

	preload() {
		this.load.atlas('penquin', 'assets/penquin.png', 'assets/penquin.json')
		this.load.image('tiles', 'assets/sheet.png')
		this.load.tilemapTiledJSON('tilemap', 'assets/game.json')

		this.load.image('star', 'assets/star.png')
		this.load.image('health', 'assets/health.png')

		this.load.atlas('snowman', 'assets/snowman.png', 'assets/snowman.json')
		this.load.atlas('bee', 'assets/Bee.png', 'assets/Bee.json')
		this.load.image('tree', 'assets/star.png')

	}

	create() {
		this.scene.launch('ui')

		const map = this.make.tilemap({ key: 'tilemap' })
		const tileset = map.addTilesetImage('iceworld', 'tiles')

		const ground = map.createLayer('ground', tileset)
		ground.setCollisionByProperty({ collides: true })

		map.createLayer('obstacles', tileset)

		const objectsLayer = map.getObjectLayer('objects')

		objectsLayer.objects.forEach(objData => {
			const { x = 0, y = 0, name, width = 0, height = 0 } = objData

			switch (name) {
				case 'penquin-spawn':
					{
						this.penquin = this.matter.add.sprite(x + (width * 0.5), y, 'penquin')
							.setFixedRotation()

						this.playerController = new PlayerController(
							this,
							this.penquin,
							this.cursors,
							this.attack,
							this.obstacles
						)

						this.cameras.main.startFollow(this.penquin, true)
						break
					}

				case 'snowman':
					{
						const snowman = this.matter.add.sprite(x, y, 'snowman')
							.setFixedRotation()

						this.snowmen.push(new SnowmanController(this, snowman))
						this.obstacles.add('snowman', snowman.body as MatterJS.BodyType)
						break
					}

				case 'star':
					{
						const star = this.matter.add.sprite(x, y, 'star', undefined, {
							isStatic: true,
							isSensor: true
						})

						star.setData('type', 'star')
						break
					}

				case 'health':
					{
						const health = this.matter.add.sprite(x, y, 'health', undefined, {
							isStatic: true,
							isSensor: true
						})

						health.setData('type', 'health')
						health.setData('healthPoints', 10)
						break
					}

				case 'spikes':
					{
						const spike = this.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
							isStatic: true
						})
						this.obstacles.add('spikes', spike)
						break
					}

				case 'bee':
					{
					const bee = this.matter.add.sprite(x, y, 'bee').setFixedRotation();
					this.bees.push(new BeeControl(this, bee, this.penquin))
					this.obstacles.add('bee', bee.body as MatterJS.BodyType)
					break
					}


				case 'tree':
					const tree = this.matter.add.sprite(x, y, 'tree').setFixedRotation();
					tree.setSensor(true)
					tree.setIgnoreGravity(true)
					this.obstacles.add('tree', tree.body as MatterJS.BodyType)
					break

			}
		})

		this.matter.world.convertTilemapLayer(ground)

	}

	destroy() {
		this.scene.stop('ui')
		this.snowmen.forEach(snowman => snowman.destroy())
		this.bees.forEach(bee => bee.destroy())
	}

	update(t: number, dt: number) {
		this.playerController?.update(dt)
		this.snowmen.forEach(snowman => snowman.update(dt))
		this.bees.forEach(bee => bee.update(dt))
		this.tree.forEach(tree => tree.update(dt))
	}
}
