extends Node

var current_area = ""
var learned_words = {}
var quiz_active = false
var transitioning = false
var save_path = "user://save.cfg"
var area_data = {
	"home": { "words": ["table", "chair", "bed", "lamp", "book"], "display": "Cozy Home" },
	"kitchen": { "words": ["apple", "banana", "bread", "milk", "egg"], "display": "Fun Kitchen" },
	"animals": { "words": ["cat", "dog", "cow", "pig", "duck"], "display": "Animal Farm" },
	"garden": { "words": ["red", "blue", "green", "yellow", "purple"], "display": "Color Garden" }
}

func _ready():
	randomize()
	load_progress()
	for a in area_data:
		if not learned_words.has(a):
			learned_words[a] = []

func is_learned(area, word):
	return learned_words.has(area) and word in learned_words[area]

func learn_word(area, word):
	if not learned_words.has(area):
		learned_words[area] = []
	if not learned_words[area].has(word):
		learned_words[area].append(word)
		save_progress()
		return true
	return false

func get_words(area):
	return area_data[area].words if area_data.has(area) else []

func get_display(area):
	return area_data[area].display if area_data.has(area) else area

func get_learned_count(area):
	return learned_words[area].size() if learned_words.has(area) else 0

func get_total_count(area):
	return area_data[area].words.size() if area_data.has(area) else 0

func is_area_complete(area):
	return get_learned_count(area) >= get_total_count(area)

func save_progress():
	var cfg = ConfigFile.new()
	for area in learned_words:
		cfg.set_value(area, "words", ",".join(learned_words[area]))
	var err = cfg.save(save_path)
	if err != OK:
		print("Failed to save progress: ", err)

func load_progress():
	var cfg = ConfigFile.new()
	var err = cfg.load(save_path)
	if err != OK:
		return
	for area in area_data:
		if cfg.has_section(area):
			var words_str = cfg.get_value(area, "words", "")
			learned_words[area] = words_str.split(",") if words_str else []

func change_scene(path):
	if transitioning:
		return
	transitioning = true
	quiz_active = false
	var current = get_tree().current_scene
	var layer = CanvasLayer.new()
	current.add_child(layer)
	var overlay = ColorRect.new()
	overlay.color = Color(0.1, 0.05, 0.0, 1)
	overlay.anchor_right = 1.0
	overlay.anchor_bottom = 1.0
	overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(overlay)
	var err = get_tree().change_scene(path)
	if err != OK:
		var _e = get_tree().change_scene("res://Scenes/MainMenu.tscn")
	yield(get_tree(), "idle_frame")
	var new_scene = get_tree().current_scene
	var layer2 = CanvasLayer.new()
	new_scene.add_child(layer2)
	var overlay2 = ColorRect.new()
	overlay2.color = Color(0.1, 0.05, 0.0, 1)
	overlay2.anchor_right = 1.0
	overlay2.anchor_bottom = 1.0
	overlay2.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer2.add_child(overlay2)
	var tween = Tween.new()
	layer2.add_child(tween)
	tween.interpolate_property(overlay2, "color", Color(0.1, 0.05, 0.0, 1), Color(0.2, 0.1, 0.0, 0), 0.3, Tween.TRANS_LINEAR, Tween.EASE_OUT)
	tween.start()
	yield(get_tree().create_timer(0.4), "timeout")
	overlay2.queue_free()
	layer2.queue_free()
	transitioning = false
