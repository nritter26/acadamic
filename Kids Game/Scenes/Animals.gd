extends Node2D

var player = null
var progress_label = null
var area_key = "animals"

func _input(event):
	if not GameManager.quiz_active and event is InputEventKey and event.scancode == KEY_ESCAPE and event.pressed and not event.echo:
		GameManager.change_scene("res://Scenes/MainMenu.tscn")

func _ready():
	GameManager.current_area = area_key
	var bg = ColorRect.new()
	bg.color = Color(0.45, 0.65, 0.35); bg.rect_size = Vector2(1280, 720)
	add_child(bg)
	var sky = ColorRect.new()
	sky.color = Color(0.64, 0.80, 0.86); sky.rect_position = Vector2(0, 0); sky.rect_size = Vector2(1280, 180)
	add_child(sky)
	var sun = ColorRect.new()
	sun.color = Color(0.96, 0.84, 0.26); sun.rect_position = Vector2(1170, 30); sun.rect_size = Vector2(30, 30)
	add_child(sun)
	var fence_post1 = ColorRect.new()
	fence_post1.color = Color(0.65, 0.42, 0.29); fence_post1.rect_position = Vector2(100, 280); fence_post1.rect_size = Vector2(10, 30)
	add_child(fence_post1)
	var fence_pt1 = ColorRect.new()
	fence_pt1.color = Color(0.65, 0.42, 0.29); fence_pt1.rect_position = Vector2(103, 274); fence_pt1.rect_size = Vector2(4, 8)
	add_child(fence_pt1)
	var fence_post2 = ColorRect.new()
	fence_post2.color = Color(0.65, 0.42, 0.29); fence_post2.rect_position = Vector2(640, 280); fence_post2.rect_size = Vector2(10, 30)
	add_child(fence_post2)
	var fence_pt2 = ColorRect.new()
	fence_pt2.color = Color(0.65, 0.42, 0.29); fence_pt2.rect_position = Vector2(643, 274); fence_pt2.rect_size = Vector2(4, 8)
	add_child(fence_pt2)
	var fence_post3 = ColorRect.new()
	fence_post3.color = Color(0.65, 0.42, 0.29); fence_post3.rect_position = Vector2(1180, 280); fence_post3.rect_size = Vector2(10, 30)
	add_child(fence_post3)
	var fence_pt3 = ColorRect.new()
	fence_pt3.color = Color(0.65, 0.42, 0.29); fence_pt3.rect_position = Vector2(1183, 274); fence_pt3.rect_size = Vector2(4, 8)
	add_child(fence_pt3)
	var fence_rail1 = ColorRect.new()
	fence_rail1.color = Color(0.7, 0.5, 0.25); fence_rail1.rect_position = Vector2(100, 285); fence_rail1.rect_size = Vector2(550, 5)
	add_child(fence_rail1)
	var fence_rail2 = ColorRect.new()
	fence_rail2.color = Color(0.7, 0.5, 0.25); fence_rail2.rect_position = Vector2(650, 285); fence_rail2.rect_size = Vector2(540, 5)
	add_child(fence_rail2)
	var straw = ColorRect.new()
	straw.color = Color(0.85, 0.75, 0.3); straw.rect_position = Vector2(0, 520); straw.rect_size = Vector2(1280, 200)
	add_child(straw)
	var water = ColorRect.new()
	water.color = Color(0.4, 0.6, 0.8); water.rect_position = Vector2(560, 550); water.rect_size = Vector2(50, 30)
	add_child(water)
	var water_highlight = ColorRect.new()
	water_highlight.color = Color(0.6, 0.8, 0.95, 0.4); water_highlight.rect_position = Vector2(562, 552); water_highlight.rect_size = Vector2(20, 4)
	add_child(water_highlight)
	for i in range(5):
		var tuft = ColorRect.new()
		tuft.color = Color(0.3, 0.6, 0.3); tuft.rect_position = Vector2(200 + i * 250, 380 + (i%3)*20); tuft.rect_size = Vector2(3, 8)
		add_child(tuft)
	create_wall(Vector2(640, -10), Vector2(1280, 20))
	create_wall(Vector2(640, 730), Vector2(1280, 20))
	create_wall(Vector2(-10, 360), Vector2(20, 720))
	create_wall(Vector2(1290, 360), Vector2(20, 720))
	var words = GameManager.get_words(area_key)
	var positions = [Vector2(200, 250), Vector2(420, 250), Vector2(640, 200), Vector2(860, 250), Vector2(1080, 250)]
	for i in range(words.size()):
		create_item(words[i], positions[i])
	var dw = preload("res://Objects/Doorway.tscn").instance()
	dw.target_scene = "res://Scenes/World.tscn"; dw.position = Vector2(640, 700)
	add_child(dw)
	var gate = ColorRect.new()
	gate.color = Color(0.6, 0.3, 0.1); gate.rect_position = Vector2(620, 690); gate.rect_size = Vector2(40, 30)
	add_child(gate)
	var gate2 = ColorRect.new()
	gate2.color = Color(0.8, 0.5, 0.2); gate2.rect_position = Vector2(610, 680); gate2.rect_size = Vector2(60, 10)
	add_child(gate2)
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
	instr.text = "Walk near animals  |  press SPACE"
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
		lbl.text = "Animals Complete! "
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
