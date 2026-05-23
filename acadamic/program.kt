enum class Color { RED, GREEN, BLUE }

fun main() {
    println("// Hello, Kotlin!")
    println()

    val name = "Kotlin"
    var version = 2.0
    println("val name = \"$name\"")
    println("var version = $version")
    println()

    fun greet(msg: String): String = "Hello, $msg!"
    println(greet("World"))
    println()

    val list = listOf(1, 2, 3)
    val map = mapOf("a" to 1, "b" to 2)
    println("list: $list")
    println("map: $map")
    println()

    val evens = (1..10).filter { it % 2 == 0 }
    println("evens: $evens")
    println()

    var nullable: String? = null
    println("nullable?.length: ${nullable?.length}")
    nullable = "ok"
    println("nullable.length: ${nullable.length}")
    println()

    data class Point(val x: Int, val y: Int)
    val p = Point(3, 4)
    println("data class Point: $p")
    println()

    val status = 200
    val msg = when (status) {
        200 -> "OK"
        404 -> "Not Found"
        else -> "Unknown"
    }
    println("when: $msg")
    println()

    fun String.exclaim() = "$this!"
    println("hello".exclaim())
    println()

    println("enum: ${Color.RED}")
    println()

    println("// Kotlin syntax demo complete")
}
