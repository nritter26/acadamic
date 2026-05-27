import cats.implicits._

object Main {
  def main(args: Array[String]): Unit = {
    // This uses the 'cats' dependency to check if a string is blank
    val testString = "   "
    val isBlank = testString.isBlank

    println("======================================")
    println(s"Scala 3 Container Test Success!")
    println(s"Is the string blank? -> $isBlank")
    println("======================================")
  }
}

