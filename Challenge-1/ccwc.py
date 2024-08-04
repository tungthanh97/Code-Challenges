#!/usr/bin/env python3

from optparse import OptionParser
import sys


def extract_data(file_data):
    """
    provide the number of bytes, character, words and lines present in the file
    """
    byte_count = char_count = word_count = line_count = 0
    for line in file_data:
        byte_count += len(line)
        word_count += len(line.split())
        char_count += len(line.decode())
        line_count += 1

    return byte_count, char_count, word_count, line_count


def print_result(
    options,
    filename,
    count_result,
):
    byte_count, char_count, word_count, line_count = count_result

    if not (options.bytes or options.characters or options.lines or options.words):
        result = f"{line_count}\t{count_result.word_count}\t{byte_count}\n"
    else:
        result = f"""{line_count if options.lines else ''}\t{word_count if options.words else ''}\t{byte_count if options.bytes else ''}\t{char_count if options.characters else ''}\t{filename}\n""".strip()
    print(result)


def main():
    parser = OptionParser(usage="usage: %prog [options] [file1 file2 ...]")
    parser.add_option(
        "-m",
        "--chars",
        dest="characters",
        action="store_true",
        default=False,
        help="Only count characters",
    )
    parser.add_option(
        "-w",
        "--words",
        dest="words",
        action="store_true",
        default=False,
        help="Only count words",
    )
    parser.add_option(
        "-l",
        "--lines",
        dest="lines",
        action="store_true",
        default=False,
        help="Only count lines",
    )
    parser.add_option(
        "-c",
        "--bytes",
        dest="bytes",
        action="store_true",
        default=False,
        help="Only count bytes",
    )
    (options, args) = parser.parse_args()

    if not (options.characters or options.words or options.lines or options.bytes):
        options.characters, options.words, options.lines = True, True, True

    if not args:
        data = sys.stdin.buffer
        result = extract_data(file_data=data)
        print_result(options, "", result)
    else:
        for file in args:
            with open(file, "rb") as file:
                result = extract_data(file_data=file)
                print_result(options, file.name, result)

    sys.exit(0)


if __name__ == "__main__":
    main()
