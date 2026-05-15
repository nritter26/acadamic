extends KinematicBody2D

const SPEED = 150
var velocity = Vector2.ZERO
var can_move = true
var walk_cycle = 0.0
var moving = false
var blink_time = 0.0

func _ready():
	add_to_group("player")

func _physics_process(delta):
	if GameManager.quiz_active or not can_move:
		velocity = Vector2.ZERO
		move_and_slide(Vector2.ZERO)
		moving = false
		return
	velocity = Vector2.ZERO
	if Input.is_key_pressed(KEY_RIGHT) or Input.is_key_pressed(KEY_D):
		velocity.x += 1
	if Input.is_key_pressed(KEY_LEFT) or Input.is_key_pressed(KEY_A):
		velocity.x -= 1
	if Input.is_key_pressed(KEY_DOWN) or Input.is_key_pressed(KEY_S):
		velocity.y += 1
	if Input.is_key_pressed(KEY_UP) or Input.is_key_pressed(KEY_W):
		velocity.y -= 1
	velocity = velocity.normalized() * SPEED
	velocity = move_and_slide(velocity)
	moving = velocity.length() > 0
	if moving:
		walk_cycle += delta * 8.0
	blink_time += delta

func _draw():
	var s = 1.0
	var bob = sin(walk_cycle) * 2 if moving else 0
	var leg_swing = sin(walk_cycle) * 4 if moving else 0
	draw_set_transform(Vector2(0, 18*s), 0, Vector2(1.3, 0.5))
	draw_circle(Vector2.ZERO, 10*s, Color(0, 0, 0, 0.15))
	draw_set_transform(Vector2(0, bob), 0, Vector2(1, 1))
	draw_rect(Rect2(-10*s, 4*s, 20*s, 9*s), Color(0.35, 0.55, 0.8))
	draw_rect(Rect2(-14*s, 5*s, 5*s, 4*s), Color(0.35, 0.55, 0.8))
	draw_rect(Rect2(9*s, 5*s, 5*s, 4*s), Color(0.35, 0.55, 0.8))
	draw_circle(Vector2.ZERO, 15*s, Color(1, 0.9, 0.2))
	draw_rect(Rect2(-7*s, -26*s, 14*s, 10*s), Color(0.9, 0.15, 0.15))
	draw_rect(Rect2(-10*s, -18*s, 20*s, 3*s), Color(0.9, 0.15, 0.15))
	if fmod(blink_time, 3.0) > 2.85:
		draw_line(Vector2(-7*s, -3*s), Vector2(-3*s, -3*s), Color(0.1, 0.1, 0.1), 1.5*s)
		draw_line(Vector2(3*s, -3*s), Vector2(7*s, -3*s), Color(0.1, 0.1, 0.1), 1.5*s)
	else:
		draw_circle(Vector2(-5*s, -3*s), 3*s, Color.WHITE)
		draw_circle(Vector2(5*s, -3*s), 3*s, Color.WHITE)
		draw_circle(Vector2(-4*s, -3*s), 1.5*s, Color(0.1, 0.1, 0.1))
		draw_circle(Vector2(6*s, -3*s), 1.5*s, Color(0.1, 0.1, 0.1))
	draw_circle(Vector2(-8*s, 2*s), 3*s, Color(1, 0.6, 0.6, 0.4))
	draw_circle(Vector2(8*s, 2*s), 3*s, Color(1, 0.6, 0.6, 0.4))
	draw_arc(Vector2(0, 4*s), 4*s, 0.2, PI-0.2, 8, Color(0.1, 0.1, 0.1), 1.5*s)
	draw_rect(Rect2(-8*s, 13*s, 6*s, 4*s + leg_swing), Color(0.5, 0.3, 0.1))
	draw_rect(Rect2(2*s, 13*s, 6*s, 4*s - leg_swing), Color(0.5, 0.3, 0.1))

func _process(delta):
	update()
