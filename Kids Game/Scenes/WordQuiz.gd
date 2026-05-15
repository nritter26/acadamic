extends CanvasLayer

var word = ""
var area = ""
var object_ref = null
var answered = false
var panel_rect = Rect2(240, 60, 800, 600)
var font_title
var font_btn_small

func setup(w, a, obj):
	word = w; area = a; object_ref = obj
	GameManager.quiz_active = true
	font_title = DrawUtils.make_font(52)
	font_btn_small = DrawUtils.make_font(26)
	var title = Label.new()
	title.text = "What is this?"
	title.rect_position = Vector2(440, 80)
	title.add_color_override("font_color", Color(0.2, 0.2, 0.2))
	title.add_font_override("font", font_title)
	title.rect_scale = Vector2(2.2, 2.2)
	add_child(title)
	var dc = preload("res://Objects/DrawCanvas.tscn").instance()
	dc.word = word; dc.position = Vector2(640, 250)
	add_child(dc)
	var fb = Label.new()
	fb.name = "Feedback"
	fb.rect_position = Vector2(440, 340)
	fb.rect_scale = Vector2(2.2, 2.2)
	fb.add_color_override("font_color", Color(0.2, 0.2, 0.2))
	fb.add_font_override("font", font_title)
	add_child(fb)
	var choices = [word]
	var all_words = GameManager.get_words(area)
	for w in all_words:
		if w != word and choices.size() < 3:
			choices.append(w)
	choices.shuffle()
	var bpos = [Vector2(330, 440), Vector2(530, 440), Vector2(730, 440)]
	if choices.size() == 2:
		bpos = [Vector2(430, 440), Vector2(630, 440)]
	var button_colors = [Color(0.38, 0.72, 0.38), Color(0.42, 0.64, 0.77), Color(0.95, 0.60, 0.20)]
	for i in range(choices.size()):
		var col = button_colors[i % button_colors.size()]
		var btn = make_button(choices[i].to_upper(), bpos[i], Vector2(180, 70), col)
		assert(btn.connect("pressed", self, "_on_choice", [choices[i]]) == OK)
		add_child(btn)
	update()

func make_button(text, pos, size, color):
	var shadow = ColorRect.new()
	shadow.color = Color(0, 0, 0, 0.15)
	shadow.rect_position = Vector2(pos.x + 4, pos.y + 4)
	shadow.rect_size = size
	add_child(shadow)
	var btn = Button.new()
	btn.text = text
	btn.rect_position = pos
	btn.rect_size = size
	btn.rect_scale = Vector2(1.1, 1.1)
	btn.add_font_override("font", font_btn_small)
	var normal = StyleBoxFlat.new()
	normal.bg_color = color
	normal.corner_radius_top_left = 14; normal.corner_radius_top_right = 14
	normal.corner_radius_bottom_left = 14; normal.corner_radius_bottom_right = 14
	btn.set("custom_styles/normal", normal)
	var hover = StyleBoxFlat.new()
	hover.bg_color = Color(color.r + 0.1, color.g + 0.1, color.b + 0.1)
	hover.corner_radius_top_left = 14; hover.corner_radius_top_right = 14
	hover.corner_radius_bottom_left = 14; hover.corner_radius_bottom_right = 14
	btn.set("custom_styles/hover", hover)
	var pressed = StyleBoxFlat.new()
	pressed.bg_color = Color(max(color.r - 0.15, 0), max(color.g - 0.15, 0), max(color.b - 0.15, 0))
	pressed.corner_radius_top_left = 14; pressed.corner_radius_top_right = 14
	pressed.corner_radius_bottom_left = 14; pressed.corner_radius_bottom_right = 14
	btn.set("custom_styles/pressed", pressed)
	btn.set("custom_colors/font_color", Color(1, 1, 1))
	btn.set("custom_colors/font_color_hover", Color(1, 1, 0.9))
	return btn

func _on_choice(choice):
	if answered:
		return
	if choice == word:
		answered = true
		var article = "an" if word[0] in "aeiou" else "a"
		var fb = get_node("Feedback")
		fb.text = "Great Job!\nIt's " + article + " " + word.to_upper() + "!"
		fb.add_color_override("font_color", Color(0.2, 0.6, 0.2))
		var sp = preload("res://Objects/Sparkle.tscn").instance()
		sp.burst(Vector2(640, 250), Color(1, 0.9, 0.2))
		add_child(sp)
		var sp2 = preload("res://Objects/Sparkle.tscn").instance()
		sp2.burst(Vector2(480, 150), Color(1, 0.3, 0.3))
		add_child(sp2)
		var sp3 = preload("res://Objects/Sparkle.tscn").instance()
		sp3.burst(Vector2(800, 150), Color(0.3, 0.5, 1))
		add_child(sp3)
		GameManager.learn_word(area, word)
		object_ref.mark_learned()
		yield(get_tree().create_timer(1.8), "timeout")
		GameManager.quiz_active = false
		var current = get_tree().current_scene
		if current and current.has_method("update_hud"):
			current.update_hud()
		queue_free()
	else:
		var fb = get_node("Feedback")
		fb.text = "Try again!"
		fb.add_color_override("font_color", Color(0.8, 0.2, 0.2))
		yield(get_tree().create_timer(0.6), "timeout")
		fb.text = ""

func _draw():
	draw_rect(Rect2(0, 0, 1280, 720), Color(0, 0, 0, 0.7))
	DrawUtils.draw_drop_shadow(self, Rect2(panel_rect.position + Vector2(8, 10), panel_rect.size), Vector2.ZERO, 20, Color(0, 0, 0, 0.25))
	DrawUtils.draw_rounded_rect(self, panel_rect, 20, Color(0.98, 0.96, 0.92))
	var inner = Rect2(panel_rect.position.x + 10, panel_rect.position.y + 10, panel_rect.size.x - 20, panel_rect.size.y - 20)
	DrawUtils.draw_rounded_rect(self, inner, 16, Color(0.65, 0.42, 0.29, 0.12))
