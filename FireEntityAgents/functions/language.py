from function_manager import register_function

@register_function("count_letter")
def count_letter(word: str, letter: str) -> int:
    """Count the number of times a letter appears in a word"""
    return word.count(letter)

@register_function("count_words")
def count_words(sentence: str) -> int:
    """Count the number of words in a sentence"""
    return len(sentence.split())