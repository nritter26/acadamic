extends Node2D

var player = null
var progress_label = null
var area_key = "kitchen"

func _input(event):
	if not GameManager.quiz_active and event is InputEventKey and event.scancode == KEY_ESCAPE and event.pressed and not event.echo:
		GameManager.change_scene("res://Scenes/MainMenu.tscn")

func _ready():
	GameManager.current_area = area_key
	var bg = ColorRect.new()
	bg.color = Color(0.98, 0.95, 0.88); bg.rect_size = Vector2(1280, 720)
	add_child(bg)
	var window = ColorRect.new()
	window.color = Color(0.7, 0.85, 0.95); window.rect_position = Vector2(580, 40); window.rect_size = Vector2(70, 50)
	add_child(window)
	var wframe = ColorRect.new()
	wframe.color = Color(0.65, 0.42, 0.29); wframe.rect_position = Vector2(580, 40); wframe.rect_size = Vector2(70, 4)
	add_child(wframe)
	wframe = ColorRect.new()
	wframe.color = Color(0.65, 0.42, 0.29); wframe.rect_position = Vector2(580, 86); wframe.rect_size = Vector2(70, 4)
	add_child(wframe)
	wframe = ColorRect.new()
	wframe.color = Color(0.65, 0.42, 0.29); wframe.rect_position = Vector2(580, 40); wframe.rect_size = Vector2(4, 50)
	add_child(wframe)
	wframe = ColorRect.new()
	wframe.color = Color(0.65, 0.42, 0.29); wframe.rect_position = Vector2(646, 40); wframe.rect_size = Vector2(4, 50)
	add_child(wframe)
	var curtain_l = ColorRect.new()
	curtain_l.color = Color(0.85, 0.5, 0.5, 0.6); curtain_l.rect_position = Vector2(574, 38); curtain_l.rect_size = Vector2(12, 54)
	add_child(curtain_l)
	var curtain_r = ColorRect.new()
	curtain_r.color = Color(0.85, 0.5, 0.5, 0.6); curtain_r.rect_position = Vector2(646, 38); curtain_r.rect_size = Vector2(12, 54)
	add_child(curtain_r)
	for x in range(0, 1280, 64):
		for y in range(450, 720, 64):
			var tile = ColorRect.new()
			tile.color = Color(0.9, 0.85, 0.8) if int((x+y)/64) % 2 == 0 else Color(0.85, 0.75, 0.6)
			tile.rect_position = Vector2(x, y); tile.rect_size = Vector2(64, 64)
			add_child(tile)
	var counter = ColorRect.new()
	counter.color = Color(0.7, 0.5, 0.3); counter.rect_position = Vector2(0, 380); counter.rect_size = Vector2(1280, 30)
	add_child(counter)
	var counter_top = ColorRect.new()
	counter_top.color = Color(0.75, 0.55, 0.35); counter_top.rect_position = Vector2(0, 378); counter_top.rect_size = Vector2(1280, 6)
	add_child(counter_top)
	for i in range(6):
		var cab_door = ColorRect.new()
		cab_door.color = Color(0.65, 0.42, 0.29); cab_door.rect_position = Vector2(50 + i * 210, 385); cab_door.rect_size = Vector2(40, 22)
		add_child(cab_door)
		var cab_knob = ColorRect.new()
		cab_knob.color = Color(0.9, 0.8, 0.2); cab_knob.rect_position = Vector2(82 + i * 210, 395); cab_knob.rect_size = Vector2(3, 3)
		add_child(cab_knob)
	var shelf = ColorRect.new()
	shelf.color = Color(0.65, 0.42, 0.29); shelf.rect_position = Vector2(0, 150); shelf.rect_size = Vector2(1280, 10)
	add_child(shelf)
	for i in range(8):
		var jar = ColorRect.new()
		var colors = [Color(1, 0.3, 0.3), Color(1, 0.8, 0.2), Color(0.3, 0.7, 0.3), Color(0.6, 0.3, 0.7)]
		jar.color = colors[i % colors.size()]; jar.rect_position = Vector2(100 + i * 150, 100); jar.rect_size = Vector2(16, 40)
		add_child(jar)
		var jar_top = ColorRect.new()
		jar_top.color = Color(0.5, 0.3, 0.1); jar_top.rect_position = Vector2(100 + i * 150, 96); jar_top.rect_size = Vector2(16, 6)
		add_child(jar_top)
	create_wall(Vector2(640, -10), Vector2(1280, 20))
	create_wall(Vector2(640, 730), Vector2(1280, 20))
	create_wall(Vector2(-10, 360), Vector2(20, 720))
	create_wall(Vector2(1290, 360), Vector2(20, 720))
	var words = GameManager.get_words(area_key)
	var positions = [Vector2(200, 300), Vector2(400, 300), Vector2(640, 300), Vector2(880, 300), Vector2(1080, 300)]
	for i in range(words.size()):
		create_item(words[i], positions[i])
	var dw = preload("res://Objects/Doorway.tscn").instance()
	dw.target_scene = "res://Scenes/World.tscn"; dw.position = Vector2(20, 360)
	add_child(dw)
	var door = ColorRect.new()
	door.color = Color(0.6, 0.3, 0.1); door.rect_position = Vector2(0, 320); door.rect_size = Vector2(30, 60)
	add_child(door)
	var door2 = ColorRect.new()
	door2.color = Color(0.8, 0.5, 0.2); door2.rect_position = Vector2(0, 315); door2.rect_size = Vector2(40, 10)
	add_child(door2)
	add_player()
	add_hud()

func create_wall(pos, size):
	var w = StaticBody2D.new(); w.position = pos
	var s = RectangleShape2D.new(); s.extents = Vector2(size.x/2, size.y/2)
	var c = CollisionShape2D.new(); c.shape = s; w.add_child(c)
	add_child(w)

func create_item(word, pos):
	var obj = preload("res://Objects/InteractiveObject.tscn").instance()
	obj.word = word; obj.area_name = area_key; obj.position = pos
	add_child(obj)

func add_player():
	player = preload("res://Objects/Player.tscn").instance()
	player.position = Vector2(640, 600)
	var cam = player.get_node("Camera2D")
	cam.limit_left = 0; cam.limit_top = 0; cam.limit_right = 1280; cam.limit_bottom = 720
	add_child(player)

func add_hud():
	var hud = CanvasLayer.new()
	var hud_font = DrawUtils.make_font(22)
	var name_lbl = Label.new()
	name_lbl.text = GameManager.get_display(area_key)
	name_lbl.rect_position = Vector2(10, 10)
	name_lbl.add_color_override("font_color", Color(1, 1, 1))
	name_lbl.add_font_override("font", hud_font)
	name_lbl.rect_scale = Vector2(1.5, 1.5)
	hud.add_child(name_lbl)
	progress_label = Label.new()
	progress_label.rect_position = Vector2(1050, 10)
	progress_label.add_color_override("font_color", Color(1, 1, 1))
	progress_label.add_font_override("font", hud_font)
	progress_label.rect_scale = Vector2(1.5, 1.5)
	progress_label.text = str(GameManager.get_learned_count(area_key)) + "/" + str(GameManager.get_total_count(area_key))
	hud.add_child(progress_label)
	var instr = Label.new()
	instr.text = "Walk near food  |  press SPACE"
	instr.rect_position = Vector2(420, 690)
	instr.add_color_override("font_color", Color(1, 1, 1, 0.6))
	instr.add_font_override("font", DrawUtils.make_font(16))
	hud.add_child(instr)
	add_child(hud)

func start_quiz(word, area, obj):
	var quiz = preload("res://Scenes/WordQuiz.tscn").instance()
	quiz.setup(word, area, obj)
	add_child(quiz)

func update_hud():
	if progress_label:
		progress_label.text = str(GameManager.get_learned_count(area_key)) + "/" + str(GameManager.get_total_count(area_key))
	if GameManager.is_area_complete(area_key):
		var lbl = Label.new()
		lbl.text = "Kitchen Complete! "
		lbl.rect_position = Vector2(380, 200)
		lbl.add_color_override("font_color", Color(1, 0.9, 0.2))
		lbl.add_font_override("font", DrawUtils.make_font(28))
		lbl.rect_scale = Vector2(2.5, 2.5)
		add_child(lbl)
		var stars = preload("res://Objects/Sparkle.tscn").instance()
		stars.burst(Vector2(640, 200), Color(1, 0.9, 0.2))
		add_child(stars)
		yield(get_tree().create_timer(2.5), "timeout")
		lbl.queue_free()
