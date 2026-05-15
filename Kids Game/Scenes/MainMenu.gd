extends Control

var font_large
var font_medium
var font_small

func _ready():
	font_large = DrawUtils.make_font(64)
	font_medium = DrawUtils.make_font(32)
	font_small = DrawUtils.make_font(20)
	var sky = ColorRect.new()
	sky.color = Color(0.64, 0.80, 0.86); sky.anchor_right = 1.0; sky.anchor_bottom = 1.0
	add_child(sky)
	var ground = ColorRect.new()
	ground.color = Color(0.52, 0.74, 0.52); ground.anchor_right = 1.0
	ground.rect_position = Vector2(0, 550); ground.rect_size = Vector2(1280, 170)
	add_child(ground)
	var title_shadow = Label.new()
	title_shadow.text = "Kid's Adventure\n   English!"
	title_shadow.rect_position = Vector2(323, 63)
	title_shadow.add_color_override("font_color", Color(0.15, 0.15, 0.25, 0.35))
	title_shadow.add_font_override("font", font_large)
	title_shadow.rect_scale = Vector2(2.6, 2.6)
	add_child(title_shadow)
	var title = Label.new()
	title.text = "Kid's Adventure\n   English!"
	title.rect_position = Vector2(320, 60)
	title.add_color_override("font_color", Color(1, 1, 1))
	title.add_font_override("font", font_large)
	title.rect_scale = Vector2(2.6, 2.6)
	add_child(title)
	var sub = Label.new()
	sub.text = "Learn English through play!"
	sub.rect_position = Vector2(460, 230)
	sub.add_color_override("font_color", Color(1, 1, 1, 0.8))
	sub.add_font_override("font", font_medium)
	sub.rect_scale = Vector2(1.3, 1.3)
	add_child(sub)
	var play_shadow = ColorRect.new()
	play_shadow.color = Color(0, 0, 0, 0.15)
	play_shadow.rect_position = Vector2(515, 343)
	play_shadow.rect_size = Vector2(260, 90)
	add_child(play_shadow)
	var play = make_menu_button("PLAY", Vector2(510, 340), Vector2(260, 90), Color(0.38, 0.72, 0.38))
	play.connect("pressed", self, "_on_play")
	add_child(play)
	var quit_shadow = ColorRect.new()
	quit_shadow.color = Color(0, 0, 0, 0.15)
	quit_shadow.rect_position = Vector2(515, 453)
	quit_shadow.rect_size = Vector2(260, 90)
	add_child(quit_shadow)
	var quit = make_menu_button("QUIT", Vector2(510, 450), Vector2(260, 90), Color(0.8, 0.3, 0.3))
	quit.connect("pressed", self, "_on_quit")
	add_child(quit)
	var instr = Label.new()
	instr.text = "Arrow Keys / WASD to move  |  SPACE / CLICK to interact"
	instr.rect_position = Vector2(300, 670)
	instr.add_color_override("font_color", Color(1, 1, 1, 0.7))
	instr.add_font_override("font", font_small)
	add_child(instr)

func make_menu_button(text, pos, size, color):
	var btn = Button.new()
	btn.text = text
	btn.rect_position = pos
	btn.rect_size = size
	btn.rect_scale = Vector2(1.2, 1.2)
	btn.add_font_override("font", font_medium)
	var normal = StyleBoxFlat.new()
	normal.bg_color = color
	normal.corner_radius_top_left = 16; normal.corner_radius_top_right = 16
	normal.corner_radius_bottom_left = 16; normal.corner_radius_bottom_right = 16
	btn.set("custom_styles/normal", normal)
	var hover = StyleBoxFlat.new()
	hover.bg_color = Color(color.r + 0.1, color.g + 0.1, color.b + 0.1)
	hover.corner_radius_top_left = 16; hover.corner_radius_top_right = 16
	hover.corner_radius_bottom_left = 16; hover.corner_radius_bottom_right = 16
	btn.set("custom_styles/hover", hover)
	var pressed = StyleBoxFlat.new()
	pressed.bg_color = Color(max(color.r - 0.15, 0), max(color.g - 0.15, 0), max(color.b - 0.15, 0))
	pressed.corner_radius_top_left = 16; pressed.corner_radius_top_right = 16
	pressed.corner_radius_bottom_left = 16; pressed.corner_radius_bottom_right = 16
	btn.set("custom_styles/pressed", pressed)
	btn.set("custom_colors/font_color", Color(1, 1, 1))
	btn.set("custom_colors/font_color_hover", Color(1, 1, 0.9))
	return btn

func _on_play():
	GameManager.change_scene("res://Scenes/World.tscn")

func _on_quit():
	get_tree().quit()

func _draw():
	draw_circle(Vector2(1100, 100), 50, Color(0.96, 0.84, 0.26))
	for i in range(12):
		var a = i * PI / 6
		draw_line(Vector2(1100, 100) + Vector2(cos(a), sin(a)) * 52, Vector2(1100, 100) + Vector2(cos(a), sin(a)) * 68, Color(0.96, 0.84, 0.26, 0.3), 3)
	draw_circle(Vector2(200, 130), 30, Color(1, 1, 1, 0.8))
	draw_circle(Vector2(232, 120), 25, Color(1, 1, 1, 0.8))
	draw_circle(Vector2(264, 130), 30, Color(1, 1, 1, 0.8))
	draw_circle(Vector2(232, 142), 22, Color(1, 1, 1, 0.8))
	draw_circle(Vector2(700, 80), 22, Color(1, 1, 1, 0.8))
	draw_circle(Vector2(725, 72), 18, Color(1, 1, 1, 0.8))
	draw_circle(Vector2(750, 80), 22, Color(1, 1, 1, 0.8))
	draw_circle(Vector2(725, 88), 16, Color(1, 1, 1, 0.8))
	draw_circle(Vector2(100, 570), 4, Color(1, 0.3, 0.3))
	draw_circle(Vector2(400, 590), 4, Color(1, 1, 0.3))
	draw_circle(Vector2(800, 575), 4, Color(0.3, 0.5, 1))
	draw_circle(Vector2(1150, 585), 4, Color(1, 0.6, 0.8))
	draw_circle(Vector2(600, 700), 4, Color(1, 0.7, 0.2))
