extends Node2D

var player = null
var hud_label = null
var progress_label = null
var area_key = "home"

func _input(event):
	if not GameManager.quiz_active and event is InputEventKey and event.scancode == KEY_ESCAPE and event.pressed and not event.echo:
		GameManager.change_scene("res://Scenes/MainMenu.tscn")

func _ready():
	GameManager.current_area = area_key
	var bg = ColorRect.new()
	bg.color = Color(0.95, 0.9, 0.8); bg.rect_size = Vector2(1280, 720)
	add_child(bg)
	var baseboard = ColorRect.new()
	baseboard.color = Color(0.6, 0.4, 0.25); baseboard.rect_position = Vector2(0, 450); baseboard.rect_size = Vector2(1280, 5)
	add_child(baseboard)
	var floor = ColorRect.new()
	floor.color = Color(0.75, 0.55, 0.35); floor.rect_position = Vector2(0, 450); floor.rect_size = Vector2(1280, 270)
	add_child(floor)
	var rug = ColorRect.new()
	rug.color = Color(0.8, 0.3, 0.3, 0.4); rug.rect_position = Vector2(530, 550); rug.rect_size = Vector2(220, 120)
	add_child(rug)
	var rug_inner = ColorRect.new()
	rug_inner.color = Color(0.85, 0.4, 0.4, 0.3); rug_inner.rect_position = Vector2(540, 560); rug_inner.rect_size = Vector2(200, 100)
	add_child(rug_inner)
	var pic_frame = ColorRect.new()
	pic_frame.color = Color(0.65, 0.42, 0.29); pic_frame.rect_position = Vector2(100, 120); pic_frame.rect_size = Vector2(40, 30)
	add_child(pic_frame)
	var pic = ColorRect.new()
	pic.color = Color(0.9, 0.8, 0.5); pic.rect_position = Vector2(104, 124); pic.rect_size = Vector2(32, 22)
	add_child(pic)
	var window = ColorRect.new()
	window.color = Color(0.7, 0.85, 0.95); window.rect_position = Vector2(600, 60); window.rect_size = Vector2(80, 60)
	add_child(window)
	var wframe = ColorRect.new()
	wframe.color = Color(0.65, 0.42, 0.29); wframe.rect_position = Vector2(600, 60); wframe.rect_size = Vector2(80, 6)
	add_child(wframe)
	wframe = ColorRect.new()
	wframe.color = Color(0.65, 0.42, 0.29); wframe.rect_position = Vector2(600, 114); wframe.rect_size = Vector2(80, 6)
	add_child(wframe)
	wframe = ColorRect.new()
	wframe.color = Color(0.65, 0.42, 0.29); wframe.rect_position = Vector2(600, 60); wframe.rect_size = Vector2(6, 60)
	add_child(wframe)
	wframe = ColorRect.new()
	wframe.color = Color(0.65, 0.42, 0.29); wframe.rect_position = Vector2(674, 60); wframe.rect_size = Vector2(6, 60)
	add_child(wframe)
	var curtain_l = ColorRect.new()
	curtain_l.color = Color(0.85, 0.5, 0.5, 0.7); curtain_l.rect_position = Vector2(592, 58); curtain_l.rect_size = Vector2(14, 64)
	add_child(curtain_l)
	var curtain_r = ColorRect.new()
	curtain_r.color = Color(0.85, 0.5, 0.5, 0.7); curtain_r.rect_position = Vector2(674, 58); curtain_r.rect_size = Vector2(14, 64)
	add_child(curtain_r)
	var valance = ColorRect.new()
	valance.color = Color(0.85, 0.5, 0.5, 0.8); valance.rect_position = Vector2(590, 55); valance.rect_size = Vector2(100, 8)
	add_child(valance)
	var w_sill = ColorRect.new()
	w_sill.color = Color(0.65, 0.42, 0.29); w_sill.rect_position = Vector2(596, 118); w_sill.rect_size = Vector2(88, 4)
	add_child(w_sill)
	create_wall(Vector2(640, -10), Vector2(1280, 20))
	create_wall(Vector2(640, 730), Vector2(1280, 20))
	create_wall(Vector2(-10, 360), Vector2(20, 720))
	create_wall(Vector2(1290, 360), Vector2(20, 720))
	var words = GameManager.get_words(area_key)
	var positions = [Vector2(200, 350), Vector2(400, 350), Vector2(640, 300), Vector2(880, 350), Vector2(1080, 350)]
	for i in range(words.size()):
		create_item(words[i], positions[i])
	var dw = preload("res://Objects/Doorway.tscn").instance()
	dw.target_scene = "res://Scenes/World.tscn"; dw.position = Vector2(1260, 360)
	add_child(dw)
	var door = ColorRect.new()
	door.color = Color(0.6, 0.3, 0.1); door.rect_position = Vector2(1250, 320); door.rect_size = Vector2(30, 60)
	add_child(door)
	var door2 = ColorRect.new()
	door2.color = Color(0.8, 0.5, 0.2); door2.rect_position = Vector2(1240, 315); door2.rect_size = Vector2(40, 10)
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
	instr.text = "Walk near an object  |  press SPACE"
	instr.rect_position = Vector2(400, 690)
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
		lbl.text = "Cozy Home Complete! "
		lbl.rect_position = Vector2(350, 200)
		lbl.add_color_override("font_color", Color(1, 0.9, 0.2))
		lbl.add_font_override("font", DrawUtils.make_font(28))
		lbl.rect_scale = Vector2(2.5, 2.5)
		add_child(lbl)
		var stars = preload("res://Objects/Sparkle.tscn").instance()
		stars.burst(Vector2(640, 200), Color(1, 0.9, 0.2))
		add_child(stars)
		yield(get_tree().create_timer(2.5), "timeout")
		lbl.queue_free()
