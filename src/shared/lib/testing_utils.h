#ifndef TESTING_UTILS_H_
#define TESTING_UTILS_H_

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define COLOR_GREEN "\033[32m"
#define COLOR_RED "\033[31m"
#define COLOR_END "\033[0m"

static bool current_test_passed = true;

#define ASSERT_EQUALS(expected, actual)                                                                                \
    do {                                                                                                               \
        if ((expected) != (actual)) {                                                                                  \
            fprintf(stderr, "    -> FAIL: %s:%d: Expected %d, got %d\n", __FILE__, __LINE__, (expected), (actual));    \
            current_test_passed = false;                                                                               \
            return;                                                                                                    \
        }                                                                                                              \
    } while (0)

#define ASSERT_TRUE(condition)                                                                                         \
    do {                                                                                                               \
        if (!(condition)) {                                                                                            \
            fprintf(stderr, "    -> FAIL: %s:%d: Condition '%s' is false\n", __FILE__, __LINE__, #condition);          \
            current_test_passed = false;                                                                               \
            return;                                                                                                    \
        }                                                                                                              \
    } while (0)

#define ASSERT_FALSE(condition)                                                                                        \
    do {                                                                                                               \
        if (condition) {                                                                                               \
            fprintf(stderr, "    -> FAIL: %s:%d: Condition '%s' is true\n", __FILE__, __LINE__, #condition);           \
            current_test_passed = false;                                                                               \
            return;                                                                                                    \
        }                                                                                                              \
    } while (0)

#define ASSERT_NULL(ptr)                                                                                               \
    do {                                                                                                               \
        if ((ptr) != NULL) {                                                                                           \
            fprintf(stderr, "    -> FAIL: %s:%d: Expected NULL, got %p\n", __FILE__, __LINE__, (void *)(ptr));         \
            current_test_passed = false;                                                                               \
            return;                                                                                                    \
        }                                                                                                              \
    } while (0)

#define ASSERT_NOT_NULL(ptr)                                                                                           \
    do {                                                                                                               \
        if ((ptr) == NULL) {                                                                                           \
            fprintf(stderr, "    -> FAIL: %s:%d: Expected NOT NULL, got NULL\n", __FILE__, __LINE__);                  \
            current_test_passed = false;                                                                               \
            return;                                                                                                    \
        }                                                                                                              \
    } while (0)

#define ASSERT_STR_EQUALS(expected, actual)                                                                            \
    do {                                                                                                               \
        const char *exp_ = (expected);                                                                                 \
        const char *act_ = (actual);                                                                                   \
        if (exp_ == NULL || act_ == NULL || strcmp(exp_, act_) != 0) {                                                 \
            fprintf(stderr, "    -> FAIL: %s:%d: Expected \"%s\", got \"%s\"\n", __FILE__, __LINE__,                   \
                    exp_ ? exp_ : "NULL", act_ ? act_ : "NULL");                                                       \
            current_test_passed = false;                                                                               \
            return;                                                                                                    \
        }                                                                                                              \
    } while (0)

#define ASSERT_MEM_EQUALS(expected, actual, size)                                                                      \
    do {                                                                                                               \
        if (memcmp((expected), (actual), (size)) != 0) {                                                               \
            fprintf(stderr, "    -> FAIL: %s:%d: Memory mismatch over %zu bytes\n", __FILE__, __LINE__,                \
                    (size_t)(size));                                                                                   \
            current_test_passed = false;                                                                               \
            return;                                                                                                    \
        }                                                                                                              \
    } while (0)

typedef void (*TestFunc)(void);

typedef struct {
    const char *name;
    TestFunc func;
} TestCase;

#define ARRAY_LENGTH(array) (sizeof((array)) / sizeof(*(array)))
#define TEST_FUNC(func) {#func, func}

#define RUN_TEST_SUITE(suite_name, tests_array)                                                                        \
    do {                                                                                                               \
        printf("\nRUNNING SUITE: %s\n", suite_name);                                                                   \
        int num_tests = ARRAY_LENGTH(tests_array);                                                                     \
        int tests_passed = 0;                                                                                          \
        for (int i = 0; i < num_tests; ++i) {                                                                          \
            current_test_passed = true;                                                                                \
            tests_array[i].func();                                                                                     \
            if (current_test_passed) {                                                                                 \
                printf(COLOR_GREEN "[ PASSED ]" COLOR_END " %s\n", tests_array[i].name);                               \
                ++tests_passed;                                                                                        \
            } else {                                                                                                   \
                printf(COLOR_RED "[ FAILED ]" COLOR_END " %s\n", tests_array[i].name);                                 \
            }                                                                                                          \
        }                                                                                                              \
        printf("\nSuite Results: %d/%d passed\n", tests_passed, num_tests);                                            \
        if (tests_passed != num_tests)                                                                                 \
            exit(EXIT_FAILURE);                                                                                        \
    } while (0)

#endif // TESTING_UTILS_H_
