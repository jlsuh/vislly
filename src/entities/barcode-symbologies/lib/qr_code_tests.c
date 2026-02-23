#include "testing_utils.h"

#include "qr_code.c"

void test_versions_1_to_9(void)
{
    int data_bits = numeric_get_content_bits(8);
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
    int data_bits = numeric_get_content_bits(600);
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
    ASSERT_TRUE(determine_version(numeric_get_content_bits(4000), EC_L,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(30, version);
    ASSERT_EQUALS(1735, codewords);
    ASSERT_TRUE(determine_version(numeric_get_content_bits(3500), EC_M,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(32, version);
    ASSERT_EQUALS(1541, codewords);
    ASSERT_TRUE(determine_version(numeric_get_content_bits(2500), EC_Q,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(32, version);
    ASSERT_EQUALS(1115, codewords);
    ASSERT_TRUE(determine_version(numeric_get_content_bits(1800), EC_H,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(31, version);
    ASSERT_EQUALS(793, codewords);
}

void test_boundary_conditions_40_L(void)
{
    int version, codewords, cci;
    ASSERT_TRUE(determine_version(numeric_get_content_bits(7088), EC_L,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(40, version);
    ASSERT_EQUALS(2956, codewords);
    ASSERT_TRUE(determine_version(numeric_get_content_bits(7089), EC_L,
                                  &version, &codewords, &cci));
    ASSERT_EQUALS(40, version);
    ASSERT_EQUALS(2956, codewords);
    ASSERT_FALSE(determine_version(numeric_get_content_bits(7090), EC_L,
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

void test_generator_polynomial_degree_7(void)
{
    init_gf_tables();
    uint8_t expected_g_exp[] = {1, 87, 229, 146, 149, 238, 102, 21};
    const uint8_t *g = compute_generator_poly(7);
    ASSERT_EQUALS(expected_g_exp[0], g[0]);
    for (int i = 1; i <= 7; ++i)
        ASSERT_EQUALS(expected_g_exp[i], gf_log[g[i]]);
}

void test_generator_polynomial_degree_10(void)
{
    init_gf_tables();
    uint8_t expected_g_exp[] = {1, 251, 67, 46, 61, 118, 70, 64, 94, 32, 45};
    const uint8_t *g = compute_generator_poly(10);
    ASSERT_EQUALS(expected_g_exp[0], g[0]);
    for (int i = 1; i <= 10; ++i)
        ASSERT_EQUALS(expected_g_exp[i], gf_log[g[i]]);
}

void test_generator_polynomial_degree_68(void)
{
    init_gf_tables();
    uint8_t expected_g_exp[] = {
        1,   247, 159, 223, 33,  224, 93,  77,  70,  90,  160, 32,  254, 43,
        150, 84,  101, 190, 205, 133, 52,  60,  202, 165, 220, 203, 151, 93,
        84,  15,  84,  253, 173, 160, 89,  227, 52,  199, 97,  95,  231, 52,
        177, 41,  125, 137, 241, 166, 225, 118, 2,   54,  32,  82,  215, 175,
        198, 43,  238, 235, 27,  101, 184, 127, 3,   5,   8,   163, 238};
    const uint8_t *g = compute_generator_poly(68);
    ASSERT_EQUALS(expected_g_exp[0], g[0]);
    for (int i = 1; i <= 68; ++i)
        ASSERT_EQUALS(expected_g_exp[i], gf_log[g[i]]);
}

void test_reed_solomon_encoding_1_M(void)
{
    init_gf_tables();
    uint8_t data_block[16] = {32, 91, 11,  120, 209, 114, 220, 77,
                              67, 64, 236, 17,  236, 17,  236, 17};
    uint8_t expected_ec[10] = {196, 35, 39, 119, 235, 215, 231, 226, 93, 23};
    uint8_t ec[10];
    const uint8_t *g = compute_generator_poly(10);
    encode_reed_solomon_block(data_block, 16, g, 10, ec);
    for (int i = 0; i < 10; ++i)
        ASSERT_EQUALS(expected_ec[i], ec[i]);
}

void test_reed_solomon_encoding_40_H(void)
{
    init_gf_tables();
    uint8_t data_block[16] = {1, 2,  3,  4,  5,  6,  7,  8,
                              9, 10, 11, 12, 13, 14, 15, 16};
    uint8_t ec[30];
    const uint8_t *g = compute_generator_poly(30);
    encode_reed_solomon_block(data_block, 16, g, 30, ec);
    uint8_t codeword[46];
    for (int i = 0; i < 16; ++i)
        codeword[i] = data_block[i];
    for (int i = 0; i < 30; ++i)
        codeword[16 + i] = ec[i];
    uint8_t remainder[30];
    encode_reed_solomon_block(codeword, 46, g, 30, remainder);
    for (int i = 0; i < 30; ++i)
        ASSERT_EQUALS(0, remainder[i]);
}

int main(void)
{
    TestCase qr_tests[] = {TEST_FUNC(test_versions_1_to_9),
                           TEST_FUNC(test_versions_10_to_26),
                           TEST_FUNC(test_versions_27_to_40),
                           TEST_FUNC(test_boundary_conditions_40_L),
                           TEST_FUNC(test_integration_buffer_write),
                           TEST_FUNC(test_generator_polynomial_degree_7),
                           TEST_FUNC(test_generator_polynomial_degree_10),
                           TEST_FUNC(test_reed_solomon_encoding_1_M),
                           TEST_FUNC(test_generator_polynomial_degree_68),
                           TEST_FUNC(test_reed_solomon_encoding_40_H)};
    RUN_TEST_SUITE("qr_code.c", qr_tests);
    return 0;
}
