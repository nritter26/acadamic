extends Node2D

var player = null

func _input(event):
	if event is InputEventKey and event.scancode == KEY_ESCAPE and event.pressed and not event.echo:
		GameManager.change_scene("res://Scenes/MainMenu.tscn")

func _ready():
	GameManager.current_area = "world"
	build_scene()
	add_player()
	add_hud()
	update()

func build_scene():
	var sky = ColorRect.new()
	sky.color = Color(0.64, 0.80, 0.86); sky.rect_size = Vector2(1920, 1080)
	add_child(sky)
	var grass = ColorRect.new()
	grass.color = Color(0.52, 0.74, 0.52); grass.rect_position = Vector2(0, 420); grass.rect_size = Vector2(1920, 660)
	add_child(grass)
	var center = ColorRect.new()
	center.color = Color(0.82, 0.69, 0.52); center.rect_position = Vector2(935, 535); center.rect_size = Vector2(50, 50)
	add_child(center)
	var pu = ColorRect.new()
	pu.color = Color(0.82, 0.69, 0.52); pu.rect_position = Vector2(940, 400); pu.rect_size = Vector2(40, 140)
	add_child(pu)
	var pd = ColorRect.new()
	pd.color = Color(0.82, 0.69, 0.52); pd.rect_position = Vector2(940, 580); pd.rect_size = Vector2(40, 140)
	add_child(pd)
	var pl = ColorRect.new()
	pl.color = Color(0.82, 0.69, 0.52); pl.rect_position = Vector2(400, 540); pl.rect_size = Vector2(540, 40)
	add_child(pl)
	var pr = ColorRect.new()
	pr.color = Color(0.82, 0.69, 0.52); pr.rect_position = Vector2(980, 540); pr.rect_size = Vector2(540, 40)
	add_child(pr)
	for x in range(420, 920, 60):
		add_path_stone(Vector2(x, 557))
	for x in range(1000, 1500, 60):
		add_path_stone(Vector2(x, 557))
	for y in range(420, 510, 60):
		add_path_stone(Vector2(956, y))
	for y in range(610, 700, 60):
		add_path_stone(Vector2(956, y))
	create_building(Vector2(120, 160), Vector2(180, 200), "COZY HOME", "res://Scenes/Home.tscn")
	create_building(Vector2(1600, 160), Vector2(180, 200), "KITCHEN", "res://Scenes/Kitchen.tscn")
	create_building(Vector2(120, 740), Vector2(180, 200), "ANIMALS", "res://Scenes/Animals.tscn")
	create_building(Vector2(1600, 740), Vector2(180, 200), "GARDEN", "res://Scenes/Garden.tscn")
	create_tree(Vector2(600, 460)); create_tree(Vector2(1300, 460))
	create_tree(Vector2(600, 800)); create_tree(Vector2(1300, 800))
	create_tree(Vector2(80, 460)); create_tree(Vector2(300, 460))
	create_tree(Vector2(1700, 500)); create_tree(Vector2(1500, 500))
	create_flower(Vector2(500, 480)); create_flower(Vector2(700, 490))
	create_flower(Vector2(1400, 470)); create_flower(Vector2(1200, 490))
	create_flower(Vector2(500, 820)); create_flower(Vector2(700, 830))
	create_flower(Vector2(1400, 810)); create_flower(Vector2(1200, 830))
	create_cloud(Vector2(200, 80), 0.2)
	create_cloud(Vector2(700, 120), 0.3)
	create_cloud(Vector2(1300, 70), 0.25)
	create_cloud(Vector2(1700, 110), 0.15)
	var sun = ColorRect.new()
	sun.color = Color(0.96, 0.84, 0.26); sun.rect_position = Vector2(1820, 20); sun.rect_size = Vector2(60, 60)
	add_child(sun)
	create_wall(Vector2(960, -10), Vector2(1920, 20))
	create_wall(Vector2(960, 1090), Vector2(1920, 20))
	create_wall(Vector2(-10, 540), Vector2(20, 1080))
	create_wall(Vector2(1930, 540), Vector2(20, 1080))

func add_path_stone(pos):
	var stone = ColorRect.new()
	stone.color = Color(0.7, 0.58, 0.42)
	stone.rect_position = pos; stone.rect_size = Vector2(8, 6)
	add_child(stone)

func create_building(pos, size, label, target):
	var shadow = ColorRect.new()
	shadow.color = Color(0, 0, 0, 0.08)
	shadow.rect_position = Vector2(pos.x - 2, pos.y + 6); shadow.rect_size = size
	add_child(shadow)
	var bldg = ColorRect.new()
	bldg.color = Color(0.65, 0.42, 0.29); bldg.rect_position = pos; bldg.rect_size = size
	add_child(bldg)
	var wall = ColorRect.new()
	wall.color = Color(0.75, 0.55, 0.35); wall.rect_position = Vector2(pos.x+5, pos.y+5); wall.rect_size = Vector2(size.x-10, size.y-10)
	add_child(wall)
	var roof_base = ColorRect.new()
	roof_base.color = Color(0.65, 0.1, 0.1); roof_base.rect_position = Vector2(pos.x - 20, pos.y - 6); roof_base.rect_size = Vector2(size.x + 40, 6)
	add_child(roof_base)
	var roof = ColorRect.new()
	roof.color = Color(0.75, 0.15, 0.15); roof.rect_position = Vector2(pos.x - 15, pos.y - 25); roof.rect_size = Vector2(size.x + 30, 25)
	add_child(roof)
	var roof2 = ColorRect.new()
	roof2.color = Color(0.85, 0.25, 0.2); roof2.rect_position = Vector2(pos.x - 10, pos.y - 20); roof2.rect_size = Vector2(size.x + 20, 15)
	add_child(roof2)
	var window = ColorRect.new()
	window.color = Color(0.7, 0.85, 0.95); window.rect_position = Vector2(pos.x + size.x/2 - 8, pos.y + 40); window.rect_size = Vector2(16, 20)
	add_child(window)
	var wcross1 = ColorRect.new()
	wcross1.color = Color(0.65, 0.42, 0.29); wcross1.rect_position = Vector2(pos.x + size.x/2 - 1, pos.y + 40); wcross1.rect_size = Vector2(2, 20)
	add_child(wcross1)
	var wcross2 = ColorRect.new()
	wcross2.color = Color(0.65, 0.42, 0.29); wcross2.rect_position = Vector2(pos.x + size.x/2 - 8, pos.y + 49); wcross2.rect_size = Vector2(16, 2)
	add_child(wcross2)
	var glow = ColorRect.new()
	glow.color = Color(1, 0.95, 0.7, 0.12); glow.rect_position = Vector2(pos.x + size.x/2 - 12, pos.y + 36); glow.rect_size = Vector2(24, 28)
	add_child(glow)
	var door = ColorRect.new()
	door.color = Color(0.4, 0.25, 0.1); door.rect_position = Vector2(pos.x + size.x/2 - 12, pos.y + size.y - 30); door.rect_size = Vector2(24, 30)
	add_child(door)
	var knob = ColorRect.new()
	knob.color = Color(0.9, 0.8, 0.2); knob.rect_position = Vector2(pos.x + size.x/2 + 5, pos.y + size.y - 18); knob.rect_size = Vector2(4, 4)
	add_child(knob)
	var step = ColorRect.new()
	step.color = Color(0.6, 0.45, 0.3); step.rect_position = Vector2(pos.x + size.x/2 - 16, pos.y + size.y); step.rect_size = Vector2(32, 4)
	add_child(step)
	var lbl = Label.new()
	lbl.text = label; lbl.rect_position = Vector2(pos.x - 5, pos.y + size.y + 8)
	lbl.add_color_override("font_color", Color(1, 1, 1))
	lbl.add_font_override("font", DrawUtils.make_font(14))
	add_child(lbl)
	var dw = preload("res://Objects/Doorway.tscn").instance()
	dw.target_scene = target; dw.position = Vector2(pos.x + size.x/2, pos.y + size.y - 15)
	add_child(dw)

func create_wall(pos, size):
	var w = StaticBody2D.new(); w.position = pos
	var s = RectangleShape2D.new(); s.extents = Vector2(size.x/2, size.y/2)
	var c = CollisionShape2D.new(); c.shape = s; w.add_child(c)
	add_child(w)

func create_tree(pos):
	var t = ColorRect.new()
	t.color = Color(0.5, 0.3, 0.1); t.rect_position = Vector2(pos.x - 3, pos.y); t.rect_size = Vector2(6, 25)
	add_child(t)
	var f1 = ColorRect.new()
	f1.color = Color(0.28, 0.58, 0.28); f1.rect_position = Vector2(pos.x - 24, pos.y - 22); f1.rect_size = Vector2(48, 26)
	add_child(f1)
	var f2 = ColorRect.new()
	f2.color = Color(0.32, 0.64, 0.32); f2.rect_position = Vector2(pos.x - 18, pos.y - 30); f2.rect_size = Vector2(36, 20)
	add_child(f2)
	var f3 = ColorRect.new()
	f3.color = Color(0.38, 0.70, 0.38); f3.rect_position = Vector2(pos.x - 12, pos.y - 36); f3.rect_size = Vector2(24, 12)
	add_child(f3)
	var f4 = ColorRect.new()
	f4.color = Color(0.5, 0.78, 0.5, 0.5); f4.rect_position = Vector2(pos.x - 6, pos.y - 40); f4.rect_size = Vector2(12, 6)
	add_child(f4)

func create_flower(pos):
	var colors = [Color(1, 0.3, 0.3), Color(0.3, 0.5, 1), Color(1, 1, 0.3), Color(1, 0.7, 0.2), Color(1, 0.5, 0.8)]
	var col = colors[randi() % colors.size()]
	var stem = ColorRect.new()
	stem.color = Color(0.2, 0.6, 0.2); stem.rect_position = Vector2(pos.x - 1, pos.y); stem.rect_size = Vector2(2, 12)
	add_child(stem)
	var head = ColorRect.new()
	head.color = col; head.rect_position = Vector2(pos.x - 4, pos.y - 8); head.rect_size = Vector2(8, 8)
	add_child(head)
	var head2 = ColorRect.new()
	head2.color = Color(1, 1, 0.5); head2.rect_position = Vector2(pos.x - 2, pos.y - 6); head2.rect_size = Vector2(4, 4)
	add_child(head2)

func create_cloud(pos, spd):
	var c = preload("res://Objects/Cloud.tscn").instance()
	c.position = pos; c.speed = spd; add_child(c)

func add_player():
	player = preload("res://Objects/Player.tscn").instance()
	player.position = Vector2(960, 600)
	var cam = player.get_node("Camera2D")
	cam.limit_left = 0; cam.limit_top = 0; cam.limit_right = 1920; cam.limit_bottom = 1080
	add_child(player)

func add_hud():
	var hud = CanvasLayer.new()
	var lbl = Label.new()
	lbl.text = "Explore the World!\nEnter a building to learn!"
	lbl.rect_position = Vector2(10, 10)
	lbl.add_color_override("font_color", Color(1, 1, 1))
	lbl.add_font_override("font", DrawUtils.make_font(22))
	lbl.rect_scale = Vector2(1.5, 1.5)
	hud.add_child(lbl)
	add_child(hud)

func start_quiz(word, area, obj):
	var quiz = preload("res://Scenes/WordQuiz.tscn").instance()
	quiz.setup(word, area, obj)
	add_child(quiz)

func _draw():
	for i in range(8):
		var a = i * PI / 4
		draw_line(Vector2(1850, 50) + Vector2(cos(a), sin(a)) * 35, Vector2(1850, 50) + Vector2(cos(a), sin(a)) * 48, Color(0.96, 0.84, 0.26, 0.25), 4)
