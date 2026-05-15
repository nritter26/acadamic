extends Node2D

var speed = 0.3
var start_x = 0.0

func _ready():
	start_x = position.x

func _process(delta):
	position.x += speed
	if position.x > 2100:
		position.x = -200

func _draw():
	draw_circle(Vector2(0, 0), 28, Color(1, 1, 1, 0.75))
	draw_circle(Vector2(24, -6), 22, Color(1, 1, 1, 0.75))
	draw_circle(Vector2(50, 0), 28, Color(1, 1, 1, 0.75))
	draw_circle(Vector2(14, 8), 20, Color(1, 1, 1, 0.75))
	draw_circle(Vector2(38, 8), 20, Color(1, 1, 1, 0.75))
	draw_circle(Vector2(12, -12), 16, Color(1, 1, 1, 0.5))
	draw_circle(Vector2(36, -12), 14, Color(1, 1, 1, 0.5))
