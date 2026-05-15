extends Area2D

export(String) var target_scene = ""

func _ready():
	assert(connect("body_entered", self, "_on_body_entered") == OK)

func _on_body_entered(body):
	if body.is_in_group("player") and not GameManager.quiz_active:
		GameManager.change_scene(target_scene)
