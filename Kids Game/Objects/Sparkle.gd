extends Node2D

var particles = []
var time = 0.0

func burst(pos, color):
	for i in range(24):
		var angle = i * PI / 12
		var spd = 50 + randi() % 80
		particles.append({
			"pos": pos,
			"vel": Vector2(cos(angle), sin(angle)) * spd,
			"color": color,
			"life": 0.8 + randf() * 0.5,
			"size": 3 + randi() % 4
		})
	position = Vector2.ZERO

func _process(delta):
	time += delta
	var alive = false
	for p in particles:
		p.life -= delta
		if p.life > 0:
			alive = true
			p.pos += p.vel * delta
			p.vel *= 0.95
	if not alive:
		queue_free()
	update()

func _draw():
	for p in particles:
		if p.life > 0:
			var a = min(p.life * 2, 1.0)
			draw_circle(p.pos, p.size, Color(p.color.r, p.color.g, p.color.b, a))
