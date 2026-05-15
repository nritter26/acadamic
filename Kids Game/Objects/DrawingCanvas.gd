extends Node2D

var word = ""

func _draw():
	if word:
		DrawUtils.draw_word_object(self, word, Vector2.ZERO, 2.0)
