import Phaser from 'phaser'
import { BossControl } from './Boss'
import ObstaclesController from './ObstaclesController'
import PlayerController from './PlayerController'
import XLowControl from './XLow'
import XHighControl from './XHigh'
import YControl from './Y'
import TreeController from './TreeController'

export default class Game extends Phaser.Scene {
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private penquin!: Phaser.Physics.Matter.Sprite
	private playerController?: PlayerController
	private obstacles!: ObstaclesController
	private XLows: XLowControl[] = []
	private bosses: BossControl[] = []
    private Ys : YControl[] = []
    private XHighs : XHighControl[] = []
	private tree: TreeController[] = []
	attack!: Phaser.Input.Keyboard.Key

	constructor() {
		super('game')
	}

	init() {
		this.cursors = this.input.keyboard.createCursorKeys()
		this.attack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
		this.obstacles = new ObstaclesController()
		this.XLows = []
		this.bosses = []
        this.Ys = []
		this.XHighs = []		
		this.tree = []

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.destroy()
		})
	}

	preload() {
		this.load.atlas('penquin', 'assets/penquin.png', 'assets/penquin.json')
		this.load.image('tiles', 'assets/sheet.png')

		this.load.tilemapTiledJSON('tilemap', 'assets/map.json')

		this.load.image('star', 'assets/star.png')
		this.load.image('health', 'assets/health.png')

		this.load.atlas('XLow', 'assets/snowman.png', 'assets/snowman.json')
		this.load.atlas('boss', 'assets/Bee.png', 'assets/Bee.json')
		this.load.atlas('Y', 'assets/snowman.png', 'assets/snowman.json')
		this.load.atlas('XHigh', 'assets/Bee.png', 'assets/Bee.json')
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

				case 'XLow':
				{
					const XLow = this.matter.add.sprite(x, y, 'XLow')
						.setFixedRotation()

					this.XLows.push(new XLowControl(this, XLow))
					this.obstacles.add('XLow', XLow.body as MatterJS.BodyType)
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

				case 'boss':
					{
					const boss = this.matter.add.sprite(x, y, 'boss').setFixedRotation();
					this.bosses.push(new BossControl(this, boss))
					this.obstacles.add('boss', boss.body as MatterJS.BodyType)
					break
					}
				case 'Y':
					{
					const Y = this.matter.add.sprite(x, y, 'Y').setFixedRotation();
					this.Ys.push(new YControl(this, Y))
					this.obstacles.add('Y', Y.body as MatterJS.BodyType)
					break
					}
					case 'XHigh':
						{
						const XHigh = this.matter.add.sprite(x, y, 'XHigh').setFixedRotation();
						this.XHighs.push(new XHighControl(this, XHigh))
						this.obstacles.add('XHigh', XHigh.body as MatterJS.BodyType)
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
		this.XLows.forEach(XLow => XLow.destroy())
		this.bosses.forEach(boss => boss.destroy())
		this.Ys.forEach(Y => Y.destroy())
	}

	update(t: number, dt: number) {
		this.playerController?.update(dt)
		this.XLows.forEach(XLow => XLow.update(dt))
		this.bosses.forEach(boss => boss.update(dt))
		this.Ys.forEach(Y => Y.update(dt))
		this.XHighs.forEach(XHigh => XHigh.update(dt))
		this.tree.forEach(tree => tree.update(dt))
	}
}
