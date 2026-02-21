#include "testing_utils.h"

#include "qr_code.c"

void test_versions_1_to_9(void)
{
    int data_bits = get_numeric_data_bits_length(8);
    int version, codewords, cci;
    ASSERT_TRUE(determine_version(data_bits, EC_L, &version, &codewords, &cci));
    ASSERT_EQUALS(1, version);
    ASSERT_EQUALS(19, codewords);
    ASSERT_TRUE(determine_version(data_bits, EC_M, &version, &codewords, &cci));
    ASSERT_EQUALS(1, version);
    ASSERT_EQUALS(16, codewords);
    ASSERT_TRUE(determine_version(data_bits, EC_Q, &version, &codewords, &cci));
    ASSERT_EQUALS(1, version);
    ASSERT_EQUALS(13, codewords);
    ASSERT_TRUE(determine_version(data_bits, EC_H, &version, &codewords, &cci));
    ASSERT_EQUALS(1, version);
    ASSERT_EQUALS(9, codewords);
}

void test_versions_10_to_26(void)
{
    int data_bits = get_numeric_data_bits_length(600);
    int version, codewords, cci;
    ASSERT_TRUE(determine_version(data_bits, EC_L, &version, &codewords, &cci));
    ASSERT_EQUALS(10, version);
    ASSERT_EQUALS(274, codewords);
    ASSERT_TRUE(determine_version(data_bits, EC_M, &version, &codewords, &cci));
    ASSERT_EQUALS(11, version);
    ASSERT_EQUALS(254, codewords);
    ASSERT_TRUE(determine_version(data_bits, EC_Q, &version, &codewords, &cci));
    ASSERT_EQUALS(14, version);
    ASSERT_EQUALS(261, codewords);
    ASSERT_TRUE(determine_version(data_bits, EC_H, &version, &codewords, &cci));
    ASSERT_EQUALS(16, version);
    ASSERT_EQUALS(253, codewords);
}

void test_versions_27_to_40(void)
{
    int version, codewords, cci;
    ASSERT_TRUE(determine_version(get_numeric_data_bits_length(4000), EC_L,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(30, version);
    ASSERT_EQUALS(1735, codewords);
    ASSERT_TRUE(determine_version(get_numeric_data_bits_length(3500), EC_M,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(32, version);
    ASSERT_EQUALS(1541, codewords);
    ASSERT_TRUE(determine_version(get_numeric_data_bits_length(2500), EC_Q,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(32, version);
    ASSERT_EQUALS(1115, codewords);
    ASSERT_TRUE(determine_version(get_numeric_data_bits_length(1800), EC_H,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(31, version);
    ASSERT_EQUALS(793, codewords);
}

void test_boundary_conditions_40_L(void)
{
    int version, codewords, cci;
    ASSERT_TRUE(determine_version(get_numeric_data_bits_length(7088), EC_L,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(40, version);
    ASSERT_EQUALS(2956, codewords);
    ASSERT_TRUE(determine_version(get_numeric_data_bits_length(7089), EC_L,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(40, version);
    ASSERT_EQUALS(2956, codewords);
    ASSERT_FALSE(determine_version(get_numeric_data_bits_length(7090), EC_L,
                                   &version, &codewords, &cci));
}

void test_integration_buffer_write(void)
{
    static char data_buffer[8192];
    for (int i = 0; i < 7089; ++i) {
        data_buffer[i] = '0' + (i % 10);
    }
    data_buffer[7089] = '\0';
    data = data_buffer;
    error_correction_level = EC_L;
    process_qr_data();
    ASSERT_TRUE(global_bit_offset > 0);
}

int main(void)
{
    TestCase qr_tests[] = {TEST_FUNC(test_versions_1_to_9),
                           TEST_FUNC(test_versions_10_to_26),
                           TEST_FUNC(test_versions_27_to_40),
                           TEST_FUNC(test_boundary_conditions_40_L),
                           TEST_FUNC(test_integration_buffer_write)};
    RUN_TEST_SUITE("qr_code.c", qr_tests);
    return 0;
}
