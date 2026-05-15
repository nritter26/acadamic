extends Area2D

export(String) var word = ""
export(String) var area_name = ""
var player_nearby = false
var learned = false
var idle_time = 0.0
onready var prompt = $Label

func _ready():
	learned = GameManager.is_learned(area_name, word)
	assert(connect("body_entered", self, "_on_body_entered") == OK)
	assert(connect("body_exited", self, "_on_body_exited") == OK)
	assert(connect("input_event", self, "_on_input_event") == OK)

func _on_body_entered(body):
	if body.is_in_group("player"):
		player_nearby = true
		if not learned:
			prompt.text = "SPACE or CLICK"

func _on_body_exited(body):
	if body.is_in_group("player"):
		player_nearby = false
		prompt.text = ""

func _on_input_event(viewport, event, shape_idx):
	if GameManager.quiz_active:
		return
	if not learned and player_nearby:
		if event is InputEventMouseButton and event.button_index == BUTTON_LEFT and event.pressed:
			get_tree().current_scene.start_quiz(word, area_name, self)
			get_tree().set_input_as_handled()

func _input(event):
	if GameManager.quiz_active:
		return
	if player_nearby and not learned:
		if event is InputEventKey and event.scancode == KEY_SPACE and event.pressed and not event.echo:
			get_tree().current_scene.start_quiz(word, area_name, self)
			get_tree().set_input_as_handled()

func _draw():
	if learned:
		return
	var float_offset = sin(idle_time * 1.5) * 3
	if player_nearby:
		var pulse = 1.0 + sin(OS.get_ticks_msec() * 0.004) * 0.2
		draw_circle(Vector2(0, float_offset), 34 * pulse, Color(1, 0.9, 0.3, 0.15))
	draw_set_transform(Vector2(0, 20 + float_offset), 0, Vector2(1.3, 0.5))
	draw_circle(Vector2.ZERO, 8, Color(0, 0, 0, 0.12))
	draw_set_transform(Vector2(0, float_offset), 0, Vector2(1, 1))
	DrawUtils.draw_word_object(self, word, Vector2.ZERO, 1.0)

func mark_learned():
	learned = true
	prompt.text = ""
	update()

func _process(delta):
	if not learned:
		idle_time += delta
		update()
