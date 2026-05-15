extends Node

const C_SKY = Color(0.64, 0.80, 0.86)
const C_GRASS = Color(0.52, 0.74, 0.52)
const C_DIRT = Color(0.82, 0.69, 0.52)
const C_WOOD = Color(0.65, 0.42, 0.29)
const C_WOOD_LIGHT = Color(0.82, 0.62, 0.42)
const C_WOOD_DARK = Color(0.50, 0.30, 0.18)
const C_WARM_YELLOW = Color(0.96, 0.84, 0.26)
const C_RED = Color(0.91, 0.33, 0.29)
const C_BLUE = Color(0.42, 0.64, 0.77)
const C_GREEN = Color(0.38, 0.72, 0.38)
const C_PURPLE = Color(0.60, 0.30, 0.70)
const C_CREAM = Color(1.0, 0.97, 0.92)
const C_BG_CREAM = Color(0.98, 0.95, 0.88)
const C_PINK = Color(1.0, 0.75, 0.80)
const C_ORANGE = Color(0.95, 0.60, 0.20)
const C_WHITE = Color(1, 1, 1)
const C_BLACK = Color(0.1, 0.1, 0.1)
const C_DARK_BROWN = Color(0.4, 0.2, 0.0)
const C_SHADOW = Color(0, 0, 0, 0.12)
const C_HIGHLIGHT = Color(1, 1, 1, 0.25)

static func draw_word_object(canvas, word, c, s):
	match word:
		"table": draw_table(canvas, c, s)
		"chair": draw_chair(canvas, c, s)
		"bed": draw_bed(canvas, c, s)
		"lamp": draw_lamp(canvas, c, s)
		"book": draw_book(canvas, c, s)
		"apple": draw_apple(canvas, c, s)
		"banana": draw_banana(canvas, c, s)
		"bread": draw_bread(canvas, c, s)
		"milk": draw_milk(canvas, c, s)
		"egg": draw_egg(canvas, c, s)
		"cat": draw_cat(canvas, c, s)
		"dog": draw_dog(canvas, c, s)
		"cow": draw_cow(canvas, c, s)
		"pig": draw_pig(canvas, c, s)
		"duck": draw_duck(canvas, c, s)
		"red": draw_color_star(canvas, c, s, C_RED)
		"blue": draw_color_star(canvas, c, s, C_BLUE)
		"green": draw_color_star(canvas, c, s, C_GREEN)
		"yellow": draw_color_star(canvas, c, s, C_WARM_YELLOW)
		"purple": draw_color_star(canvas, c, s, C_PURPLE)

static func draw_rounded_rect(canvas, rect, radius, color):
	var r = radius
	var x = rect.position.x
	var y = rect.position.y
	var w = rect.size.x
	var h = rect.size.y
	canvas.draw_rect(Rect2(x + r, y, w - 2*r, h), color)
	canvas.draw_rect(Rect2(x, y + r, r, h - 2*r), color)
	canvas.draw_rect(Rect2(x + w - r, y + r, r, h - 2*r), color)
	canvas.draw_circle(Vector2(x + r, y + r), r, color)
	canvas.draw_circle(Vector2(x + w - r, y + r), r, color)
	canvas.draw_circle(Vector2(x + r, y + h - r), r, color)
	canvas.draw_circle(Vector2(x + w - r, y + h - r), r, color)

static func draw_drop_shadow(canvas, rect, offset, radius, color):
	var sr = Rect2(rect.position.x + offset.x, rect.position.y + offset.y, rect.size.x, rect.size.y)
	draw_rounded_rect(canvas, sr, radius, color)

static func make_font(size):
	var fd = DynamicFontData.new()
	fd.font_path = "res://Fonts/FredokaOne-Regular.ttf"
	var f = DynamicFont.new()
	f.font_data = fd
	f.size = size
	return f

static func draw_apple(canvas, c, s):
	canvas.draw_circle(c + Vector2(0, 1)*s, 14*s, C_RED)
	canvas.draw_circle(c + Vector2(2, 0)*s, 13*s, Color(0.8, 0.2, 0.18, 0.4))
	canvas.draw_line(c + Vector2(0, -12*s), c + Vector2(1, -18*s), C_DARK_BROWN, 2*s)
	canvas.draw_circle(c + Vector2(5*s, -16*s), 4*s, C_GREEN)
	canvas.draw_circle(c + Vector2(3*s, -17*s), 2*s, Color(0.2, 0.55, 0.2))
	canvas.draw_circle(c + Vector2(-4*s, -4*s), 4*s, Color(1, 0.8, 0.8, 0.35))
	canvas.draw_circle(c + Vector2(-3*s, -5*s), 2*s, Color(1, 0.9, 0.9, 0.4))

static func draw_banana(canvas, c, s):
	canvas.draw_set_transform(c, 0.4, Vector2(s*1.1, s*1.1))
	canvas.draw_circle(Vector2(0, -4), 14, Color(0.9, 0.78, 0.2))
	canvas.draw_circle(Vector2(0, 4), 10, Color(0.9, 0.78, 0.2))
	canvas.draw_rect(Rect2(-14, -6, 28, 6), Color(0.9, 0.78, 0.2))
	canvas.draw_set_transform(c, 0.4, Vector2(s*1.1, s*1.1))
	canvas.draw_circle(Vector2(0, -3), 13, C_WARM_YELLOW)
	canvas.draw_circle(Vector2(0, 3), 9, C_WARM_YELLOW)
	canvas.draw_rect(Rect2(-13, -5, 26, 5), C_WARM_YELLOW)
	canvas.draw_set_transform(c, 0, Vector2(1, 1))
	canvas.draw_line(c + Vector2(0, -10*s), c + Vector2(0, -14*s), Color(0.5, 0.35, 0.1), 2*s)
	canvas.draw_circle(c + Vector2(0, -13*s), 1.5*s, Color(0.4, 0.25, 0.05))

static func draw_bread(canvas, c, s):
	canvas.draw_rect(Rect2(c.x - 12*s, c.y - 10*s, 24*s, 22*s), Color(0.8, 0.55, 0.25))
	canvas.draw_rect(Rect2(c.x - 10*s, c.y - 8*s, 20*s, 18*s), C_CREAM)
	canvas.draw_circle(c + Vector2(0, -10*s), 8*s, Color(0.8, 0.55, 0.25))
	canvas.draw_circle(c + Vector2(0, -9*s), 7*s, C_CREAM)
	canvas.draw_circle(c + Vector2(-3*s, -2*s), 1*s, Color(0.85, 0.7, 0.4, 0.4))
	canvas.draw_circle(c + Vector2(4*s, 0*s), 1*s, Color(0.85, 0.7, 0.4, 0.4))
	canvas.draw_circle(c + Vector2(-1*s, 4*s), 1.5*s, Color(0.85, 0.7, 0.4, 0.4))

static func draw_milk(canvas, c, s):
	canvas.draw_rect(Rect2(c.x - 8*s, c.y - 16*s, 16*s, 32*s), C_WHITE)
	canvas.draw_rect(Rect2(c.x - 8*s, c.y - 16*s, 8*s, 32*s), Color(0.95, 0.95, 0.95))
	canvas.draw_rect(Rect2(c.x - 6*s, c.y - 18*s, 12*s, 4*s), C_BLUE)
	canvas.draw_line(c + Vector2(0, -18*s), c + Vector2(0, -22*s), C_BLUE, 2*s)
	canvas.draw_line(c + Vector2(-8*s, 0), c + Vector2(8*s, 0), Color(0.9, 0.9, 0.9), 1*s)
	canvas.draw_line(c + Vector2(-8*s, 8*s), c + Vector2(8*s, 8*s), Color(0.9, 0.9, 0.9), 1*s)

static func draw_egg(canvas, c, s):
	canvas.draw_set_transform(c, 0, Vector2(s, s*1.3))
	canvas.draw_circle(Vector2(0, 0), 12, Color(0.92, 0.88, 0.78))
	canvas.draw_set_transform(c, 0.1, Vector2(s*0.95, s*1.25))
	canvas.draw_circle(Vector2(0, 0), 11, Color(0.97, 0.94, 0.87))
	canvas.draw_set_transform(c, 0, Vector2(1, 1))
	canvas.draw_circle(c + Vector2(-3*s, -4*s), 3*s, Color(1, 1, 1, 0.45))

static func draw_table(canvas, c, s):
	canvas.draw_rect(Rect2(c.x - 18*s, c.y - 2*s, 36*s, 4*s), C_WOOD)
	canvas.draw_rect(Rect2(c.x - 18*s, c.y - 2*s, 36*s, 2*s), C_WOOD_LIGHT)
	canvas.draw_rect(Rect2(c.x - 14*s, c.y + 2*s, 3*s, 16*s), C_WOOD_DARK)
	canvas.draw_rect(Rect2(c.x + 11*s, c.y + 2*s, 3*s, 16*s), C_WOOD_DARK)
	canvas.draw_rect(Rect2(c.x - 14*s, c.y + 2*s, 4*s, 16*s), C_WOOD)
	canvas.draw_rect(Rect2(c.x + 10*s, c.y + 2*s, 4*s, 16*s), C_WOOD)

static func draw_chair(canvas, c, s):
	canvas.draw_rect(Rect2(c.x - 10*s, c.y + 2*s, 20*s, 4*s), C_WOOD)
	canvas.draw_rect(Rect2(c.x - 10*s, c.y + 2*s, 20*s, 2*s), C_WOOD_LIGHT)
	canvas.draw_rect(Rect2(c.x - 10*s, c.y - 14*s, 3*s, 20*s), C_WOOD_DARK)
	canvas.draw_rect(Rect2(c.x - 10*s, c.y - 14*s, 4*s, 20*s), C_WOOD)
	canvas.draw_rect(Rect2(c.x - 10*s, c.y - 14*s, 18*s, 4*s), C_WOOD_LIGHT)
	canvas.draw_rect(Rect2(c.x + 4*s, c.y - 10*s, 3*s, 14*s), C_WOOD)

static func draw_bed(canvas, c, s):
	canvas.draw_rect(Rect2(c.x - 18*s, c.y - 12*s, 36*s, 28*s), C_BLUE)
	canvas.draw_rect(Rect2(c.x - 16*s, c.y - 6*s, 14*s, 12*s), C_WHITE)
	canvas.draw_rect(Rect2(c.x - 16*s, c.y - 6*s, 14*s, 4*s), Color(1, 1, 1, 0.6))
	canvas.draw_rect(Rect2(c.x - 18*s, c.y + 16*s, 36*s, 4*s), C_WOOD)
	canvas.draw_rect(Rect2(c.x - 18*s, c.y + 16*s, 36*s, 2*s), C_WOOD_DARK)

static func draw_lamp(canvas, c, s):
	canvas.draw_rect(Rect2(c.x - 2*s, c.y - 4*s, 4*s, 20*s), C_WOOD)
	canvas.draw_rect(Rect2(c.x - 6*s, c.y + 16*s, 12*s, 3*s), C_WOOD)
	canvas.draw_circle(c + Vector2(0, -8*s), 8*s, C_WARM_YELLOW)
	canvas.draw_circle(c + Vector2(0, -8*s), 5*s, Color(1.0, 0.95, 0.7, 0.5))
	canvas.draw_line(c + Vector2(-10*s, -8*s), c + Vector2(-14*s, -8*s), Color(1, 0.95, 0.5, 0.12), 2*s)
	canvas.draw_line(c + Vector2(10*s, -8*s), c + Vector2(14*s, -8*s), Color(1, 0.95, 0.5, 0.12), 2*s)
	canvas.draw_line(c + Vector2(0, -18*s), c + Vector2(0, -22*s), Color(1, 0.95, 0.5, 0.12), 2*s)
	canvas.draw_line(c + Vector2(0, 2*s), c + Vector2(0, 6*s), Color(1, 0.9, 0.5, 0.08), 2*s)

static func draw_book(canvas, c, s):
	canvas.draw_rect(Rect2(c.x - 8*s, c.y - 12*s, 16*s, 24*s), Color(0.8, 0.25, 0.22))
	canvas.draw_rect(Rect2(c.x - 7*s, c.y - 11*s, 14*s, 22*s), C_RED)
	canvas.draw_rect(Rect2(c.x - 6*s, c.y - 10*s, 12*s, 20*s), C_WHITE)
	canvas.draw_rect(Rect2(c.x - 6*s, c.y - 10*s, 6*s, 20*s), Color(0.98, 0.98, 0.95))
	canvas.draw_line(c + Vector2(-4*s, -6*s), c + Vector2(4*s, -6*s), C_BLACK, 1*s)
	canvas.draw_line(c + Vector2(-4*s, -2*s), c + Vector2(4*s, -2*s), C_BLACK, 1*s)
	canvas.draw_line(c + Vector2(-4*s, 2*s), c + Vector2(4*s, 2*s), C_BLACK, 1*s)
	canvas.draw_line(c + Vector2(-4*s, 6*s), c + Vector2(4*s, 6*s), C_BLACK, 1*s)
	canvas.draw_rect(Rect2(c.x + 7*s, c.y - 2*s, 3*s, 10*s), C_GREEN)
	canvas.draw_circle(c + Vector2(8*s, 8*s), 2*s, C_GREEN)

static func draw_cat(canvas, c, s):
	canvas.draw_circle(c, 14*s, C_ORANGE)
	canvas.draw_circle(c + Vector2(-11*s, -10*s), 6*s, C_ORANGE)
	canvas.draw_circle(c + Vector2(11*s, -10*s), 6*s, C_ORANGE)
	canvas.draw_circle(c + Vector2(-9*s, -10*s), 4*s, Color(1, 0.7, 0.3))
	canvas.draw_circle(c + Vector2(9*s, -10*s), 4*s, Color(1, 0.7, 0.3))
	canvas.draw_circle(c + Vector2(-4*s, -3*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(4*s, -3*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(-3*s, -3*s), 1.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(5*s, -3*s), 1.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(0, 4*s), 3*s, C_PINK)
	canvas.draw_line(c + Vector2(-8*s, 2*s), c + Vector2(-14*s, 0*s), C_BLACK, 1*s)
	canvas.draw_line(c + Vector2(8*s, 2*s), c + Vector2(14*s, 0*s), C_BLACK, 1*s)
	canvas.draw_arc(c + Vector2(-14*s, 10*s), 6*s, PI*0.5, PI*1.5, 6, Color(0.85, 0.5, 0.15), 3*s)
	canvas.draw_circle(c + Vector2(-7*s, 12*s), 3*s, C_ORANGE)
	canvas.draw_circle(c + Vector2(7*s, 12*s), 3*s, C_ORANGE)

static func draw_dog(canvas, c, s):
	canvas.draw_circle(c + Vector2(0, 2*s), 14*s, Color(0.75, 0.55, 0.25))
	canvas.draw_circle(c + Vector2(-8*s, -8*s), 6*s, Color(0.65, 0.45, 0.2))
	canvas.draw_circle(c + Vector2(8*s, -8*s), 6*s, Color(0.65, 0.45, 0.2))
	canvas.draw_circle(c + Vector2(-8*s, -8*s), 3*s, Color(0.5, 0.3, 0.1))
	canvas.draw_circle(c + Vector2(8*s, -8*s), 3*s, Color(0.5, 0.3, 0.1))
	canvas.draw_circle(c + Vector2(-4*s, 0*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(4*s, 0*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(-3*s, 0*s), 1.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(5*s, 0*s), 1.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(0, 6*s), 4*s, Color(0.4, 0.25, 0.1))
	canvas.draw_circle(c + Vector2(-7*s, 14*s), 3*s, Color(0.75, 0.55, 0.25))
	canvas.draw_circle(c + Vector2(7*s, 14*s), 3*s, Color(0.75, 0.55, 0.25))

static func draw_cow(canvas, c, s):
	canvas.draw_circle(c + Vector2(0, 2*s), 15*s, C_WHITE)
	canvas.draw_circle(c + Vector2(-5*s, -6*s), 4*s, C_BLACK)
	canvas.draw_circle(c + Vector2(6*s, -2*s), 3*s, C_BLACK)
	canvas.draw_circle(c + Vector2(-2*s, 6*s), 3*s, C_BLACK)
	canvas.draw_circle(c + Vector2(0, -5*s), 2*s, C_PINK)
	canvas.draw_circle(c + Vector2(-4*s, 0*s), 2.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(4*s, 0*s), 2.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(-3*s, 0*s), 1.2*s, C_WHITE)
	canvas.draw_circle(c + Vector2(5*s, 0*s), 1.2*s, C_WHITE)
	canvas.draw_circle(c + Vector2(-12*s, -8*s), 4*s, C_WHITE)
	canvas.draw_circle(c + Vector2(12*s, -8*s), 4*s, C_WHITE)
	canvas.draw_circle(c + Vector2(-8*s, 14*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(8*s, 14*s), 3*s, C_WHITE)
	canvas.draw_line(c + Vector2(0, 16*s), c + Vector2(2*s, 21*s), C_WHITE, 2*s)
	canvas.draw_circle(c + Vector2(2*s, 21*s), 1.5*s, C_BLACK)

static func draw_pig(canvas, c, s):
	canvas.draw_circle(c, 14*s, C_PINK)
	canvas.draw_circle(c + Vector2(-4*s, -2*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(4*s, -2*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(-3*s, -2*s), 1.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(5*s, -2*s), 1.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(0, 6*s), 5*s, C_PINK)
	canvas.draw_circle(c + Vector2(0, 6*s), 3*s, Color(0.9, 0.6, 0.7))
	canvas.draw_circle(c + Vector2(-10*s, 10*s), 4*s, C_PINK)
	canvas.draw_circle(c + Vector2(10*s, 10*s), 4*s, C_PINK)
	canvas.draw_circle(c + Vector2(-7*s, 14*s), 3*s, C_PINK)
	canvas.draw_circle(c + Vector2(7*s, 14*s), 3*s, C_PINK)
	canvas.draw_arc(c + Vector2(0, -12*s), 4*s, PI*0.2, PI*1.3, 6, Color(0.9, 0.65, 0.7), 2*s)

static func draw_duck(canvas, c, s):
	canvas.draw_circle(c + Vector2(0, 2*s), 13*s, C_WARM_YELLOW)
	canvas.draw_circle(c + Vector2(-10*s, -4*s), 6*s, C_WARM_YELLOW)
	canvas.draw_circle(c + Vector2(10*s, -4*s), 6*s, C_WARM_YELLOW)
	canvas.draw_circle(c + Vector2(-3*s, -2*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(3*s, -2*s), 3*s, C_WHITE)
	canvas.draw_circle(c + Vector2(-2*s, -2*s), 1.5*s, C_BLACK)
	canvas.draw_circle(c + Vector2(4*s, -2*s), 1.5*s, C_BLACK)
	canvas.draw_rect(Rect2(c.x - 2*s, c.y + 6*s, 8*s, 3*s), C_ORANGE)
	canvas.draw_circle(c + Vector2(10*s, -12*s), 3*s, C_WARM_YELLOW)
	canvas.draw_circle(c + Vector2(-4*s, 5*s), 4*s, Color(0.85, 0.7, 0.15))
	canvas.draw_line(c + Vector2(-4*s, 15*s), c + Vector2(-5*s, 20*s), C_ORANGE, 2*s)
	canvas.draw_line(c + Vector2(4*s, 15*s), c + Vector2(5*s, 20*s), C_ORANGE, 2*s)
	canvas.draw_circle(c + Vector2(-5*s, 20*s), 1.5*s, C_ORANGE)
	canvas.draw_circle(c + Vector2(5*s, 20*s), 1.5*s, C_ORANGE)

static func draw_color_star(canvas, c, s, color):
	var pts = PoolVector2Array()
	for i in range(10):
		var angle = i * PI / 5 - PI / 2
		var r = 14*s if i % 2 == 0 else 6*s
		pts.append(c + Vector2(cos(angle), sin(angle)) * r)
	canvas.draw_colored_polygon(pts, color)
	canvas.draw_circle(c, 10*s, Color(color.r, color.g, color.b, 0.2))
