extends Node2D

var player = null
var progress_label = null
var area_key = "garden"

func _input(event):
	if not GameManager.quiz_active and event is InputEventKey and event.scancode == KEY_ESCAPE and event.pressed and not event.echo:
		GameManager.change_scene("res://Scenes/MainMenu.tscn")

func _ready():
	GameManager.current_area = area_key
	var bg = ColorRect.new()
	bg.color = Color(0.64, 0.80, 0.86); bg.rect_size = Vector2(1280, 720)
	add_child(bg)
	var grass = ColorRect.new()
	grass.color = Color(0.52, 0.74, 0.52); grass.rect_position = Vector2(0, 300); grass.rect_size = Vector2(1280, 420)
	add_child(grass)
	var fence_top = ColorRect.new()
	fence_top.color = Color(0.7, 0.5, 0.25); fence_top.rect_position = Vector2(0, 280); fence_top.rect_size = Vector2(1280, 8)
	add_child(fence_top)
	for x in range(50, 1280, 80):
		var post = ColorRect.new()
		post.color = Color(0.65, 0.42, 0.29); post.rect_position = Vector2(x, 265); post.rect_size = Vector2(8, 30)
		add_child(post)
		var post_pt = ColorRect.new()
		post_pt.color = Color(0.65, 0.42, 0.29); post_pt.rect_position = Vector2(x + 2, 259); post_pt.rect_size = Vector2(4, 8)
		add_child(post_pt)
	var fence_l = ColorRect.new()
	fence_l.color = Color(0.7, 0.5, 0.25); fence_l.rect_position = Vector2(0, 280); fence_l.rect_size = Vector2(10, 200)
	add_child(fence_l)
	var fence_r = ColorRect.new()
	fence_r.color = Color(0.7, 0.5, 0.25); fence_r.rect_position = Vector2(1270, 280); fence_r.rect_size = Vector2(10, 200)
	add_child(fence_r)
	for x in range(300, 1000, 80):
		var stone = ColorRect.new()
		stone.color = Color(0.75, 0.65, 0.5); stone.rect_position = Vector2(x, 620); stone.rect_size = Vector2(12, 5)
		add_child(stone)
	for i in range(10):
		var fl = ColorRect.new()
		var cols = [Color(1, 0.3, 0.3), Color(0.3, 0.5, 1), Color(1, 1, 0.3), Color(1, 0.6, 0.1), Color(1, 0.5, 0.8)]
		fl.color = cols[randi() % cols.size()]
		fl.rect_position = Vector2(60 + i * 120, 400 + (randi() % 3) * 40)
		fl.rect_size = Vector2(8, 8)
		add_child(fl)
		var stem = ColorRect.new()
		stem.color = Color(0.2, 0.6, 0.2); stem.rect_position = Vector2(60 + i * 120 + 3, 408 + (randi() % 3) * 40); stem.rect_size = Vector2(2, 12)
		add_child(stem)
	create_wall(Vector2(640, -10), Vector2(1280, 20))
	create_wall(Vector2(640, 730), Vector2(1280, 20))
	create_wall(Vector2(-10, 360), Vector2(20, 720))
	create_wall(Vector2(1290, 360), Vector2(20, 720))
	var words = GameManager.get_words(area_key)
	var positions = [Vector2(200, 450), Vector2(420, 420), Vector2(640, 450), Vector2(860, 420), Vector2(1080, 450)]
	for i in range(words.size()):
		create_item(words[i], positions[i])
	var dw = preload("res://Objects/Doorway.tscn").instance()
	dw.target_scene = "res://Scenes/World.tscn"; dw.position = Vector2(640, 700)
	add_child(dw)
	var gate = ColorRect.new()
	gate.color = Color(0.6, 0.3, 0.1); gate.rect_position = Vector2(620, 690); gate.rect_size = Vector2(40, 30)
	add_child(gate)
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
	instr.text = "Walk near colors  |  press SPACE"
	instr.rect_position = Vector2(410, 690)
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
		lbl.text = "Garden Complete! "
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
