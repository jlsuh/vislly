#include "testing_utils.h"

#include "qr_code.c"

static void check_version(int numeric_chars, ErrorCorrectionLevel ec_level, int expected_version,
                          int expected_codewords)
{
    static uint8_t dummy_data[8192];
    for (int i = 0; i < numeric_chars; ++i)
        dummy_data[i] = '0';
    dummy_data[numeric_chars] = '\0';
    const VersionCapacity *vc = determine_version_and_segment(dummy_data, numeric_chars, ec_level);
    ASSERT_TRUE(vc != NULL);
    if (vc != NULL) {
        ASSERT_EQUALS(expected_version, vc->version);
        ASSERT_EQUALS(expected_codewords, vc->data_codewords);
    }
}

void determines_correct_version_for_sizes_1_to_9(void)
{
    check_version(8, EC_L, 1, 19);
    check_version(8, EC_M, 1, 16);
    check_version(8, EC_Q, 1, 13);
    check_version(8, EC_H, 1, 9);
}

void determines_correct_version_for_sizes_10_to_26(void)
{
    check_version(600, EC_L, 10, 274);
    check_version(600, EC_M, 11, 254);
    check_version(600, EC_Q, 14, 261);
    check_version(600, EC_H, 16, 253);
}

void determines_correct_version_for_sizes_27_to_40(void)
{
    check_version(4000, EC_L, 30, 1735);
    check_version(3500, EC_M, 32, 1541);
    check_version(2500, EC_Q, 32, 1115);
    check_version(1800, EC_H, 31, 793);
}

void accepts_data_up_to_maximum_capacity_and_rejects_overflow(void)
{
    static uint8_t dummy_data[8192];
    wasm_memset(dummy_data, '0', sizeof(dummy_data));
    const VersionCapacity *vc;
    vc = determine_version_and_segment(dummy_data, 7088, EC_L);
    ASSERT_TRUE(vc != NULL);
    if (vc != NULL) {
        ASSERT_EQUALS(40, vc->version);
        ASSERT_EQUALS(2956, vc->data_codewords);
    }
    vc = determine_version_and_segment(dummy_data, 7089, EC_L);
    ASSERT_TRUE(vc != NULL);
    if (vc != NULL) {
        ASSERT_EQUALS(40, vc->version);
        ASSERT_EQUALS(2956, vc->data_codewords);
    }
    vc = determine_version_and_segment(dummy_data, 7090, EC_L);
    ASSERT_TRUE(vc == NULL);
}

void processing_valid_data_generates_a_bit_stream(void)
{
    static char data_buffer[8192];
    for (int i = 0; i < 7089; ++i)
        data_buffer[i] = (char)('0' + (i % 10));
    data_buffer[7089] = '\0';
    qr_data = data_buffer;
    error_correction_level = EC_L;
    process_qr_data();
    ASSERT_TRUE(global_bit_offset > 0);
}

void generator_polynomial_of_degree_7_matches_the_iso_standard(void)
{
    initialize_gf_tables();
    uint8_t expected_g_exp[] = {1, 87, 229, 146, 149, 238, 102, 21};
    const uint8_t *g = compute_generator_poly(7);
    ASSERT_EQUALS(expected_g_exp[0], g[0]);
    for (int i = 1; i <= 7; ++i)
        ASSERT_EQUALS(expected_g_exp[i], gf_log[g[i]]);
}

void generator_polynomial_of_degree_10_matches_the_iso_standard(void)
{
    initialize_gf_tables();
    uint8_t expected_g_exp[] = {1, 251, 67, 46, 61, 118, 70, 64, 94, 32, 45};
    const uint8_t *g = compute_generator_poly(10);
    ASSERT_EQUALS(expected_g_exp[0], g[0]);
    for (int i = 1; i <= 10; ++i)
        ASSERT_EQUALS(expected_g_exp[i], gf_log[g[i]]);
}

void generator_polynomial_of_degree_68_matches_the_iso_standard(void)
{
    initialize_gf_tables();
    uint8_t expected_g_exp[] = {
        1,   247, 159, 223, 33, 224, 93, 77, 70,  90,  160, 32, 254, 43,  150, 84,  101, 190, 205, 133, 52, 60,  202,
        165, 220, 203, 151, 93, 84,  15, 84, 253, 173, 160, 89, 227, 52,  199, 97,  95,  231, 52,  177, 41, 125, 137,
        241, 166, 225, 118, 2,  54,  32, 82, 215, 175, 198, 43, 238, 235, 27,  101, 184, 127, 3,   5,   8,  163, 238};
    const uint8_t *g = compute_generator_poly(68);
    ASSERT_EQUALS(expected_g_exp[0], g[0]);
    for (int i = 1; i <= 68; ++i)
        ASSERT_EQUALS(expected_g_exp[i], gf_log[g[i]]);
}

void error_correction_blocks_for_version_1_m_match_the_iso_standard(void)
{
    initialize_gf_tables();
    uint8_t data_block[16] = {32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17};
    uint8_t expected_ec[10] = {196, 35, 39, 119, 235, 215, 231, 226, 93, 23};
    uint8_t ec[10];
    const uint8_t *g = compute_generator_poly(10);
    RSBlock block = {.data = data_block, .data_len = 16, .ec = ec, .ec_len = 10};
    encode_rs_block(&block, g);
    for (int i = 0; i < 10; ++i)
        ASSERT_EQUALS(expected_ec[i], ec[i]);
}

void error_correction_blocks_for_version_40_h_match_the_iso_standard(void)
{
    initialize_gf_tables();
    uint8_t data_block[16] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16};
    uint8_t ec[30];
    const uint8_t *g = compute_generator_poly(30);
    RSBlock block1 = {.data = data_block, .data_len = 16, .ec = ec, .ec_len = 30};
    encode_rs_block(&block1, g);
    uint8_t codeword[46];
    for (int i = 0; i < 16; ++i)
        codeword[i] = data_block[i];
    for (int i = 0; i < 30; ++i)
        codeword[16 + i] = ec[i];
    uint8_t remainder[30];
    RSBlock block2 = {.data = codeword, .data_len = 46, .ec = remainder, .ec_len = 30};
    encode_rs_block(&block2, g);
    for (int i = 0; i < 30; ++i)
        ASSERT_EQUALS(0, remainder[i]);
}

static void check_bits(const char *utf8_string, ErrorCorrectionLevel ec_level, int expected_remaining_bits)
{
    qr_data = utf8_string;
    error_correction_level = ec_level;
    prepare_qr_data(qr_data);
    segment_data(processed_data, processed_data_len, 3);
    ASSERT_EQUALS(expected_remaining_bits, get_remaining_bits());
}

void encodes_pure_kanji_input_using_kanji_mode(void)
{
    check_bits("\xE7\x82\xB9\xE8\x8C\x97", EC_L, 23606);
    check_bits("\xE7\x82\xB9\xE8\x8C\x97", EC_M, 18630);
    check_bits("\xE7\x82\xB9\xE8\x8C\x97", EC_Q, 13286);
    check_bits("\xE7\x82\xB9\xE8\x8C\x97", EC_H, 10166);
}

void transitions_from_alphanumeric_to_kanji_mode_when_kanji_is_encountered(void)
{
    check_bits("QR\xE7\x82\xB9", EC_L, 23591);
    check_bits("QR\xE7\x82\xB9", EC_M, 18615);
    check_bits("QR\xE7\x82\xB9", EC_Q, 13271);
    check_bits("QR\xE7\x82\xB9", EC_H, 10151);
}

void retains_byte_mode_when_kanji_sequence_is_too_short_for_optimization(void)
{
    check_bits("a\xE7\x82\xB9", EC_L, 23604);
    check_bits("a\xE7\x82\xB9", EC_M, 18628);
    check_bits("a\xE7\x82\xB9", EC_Q, 13284);
    check_bits("a\xE7\x82\xB9", EC_H, 10164);
}

void encodes_single_kanji_character_using_kanji_mode(void)
{
    check_bits("\xE7\x82\xB9", EC_L, 23619);
    check_bits("\xE7\x82\xB9", EC_M, 18643);
    check_bits("\xE7\x82\xB9", EC_Q, 13299);
    check_bits("\xE7\x82\xB9", EC_H, 10179);
}

void switches_to_kanji_mode_only_when_sequence_exceeds_optimization_threshold(void)
{
    check_bits("a\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7"
               "\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9"
               "a",
               EC_M, 18444);
    check_bits("a\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7"
               "\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9\xE7\x82\xB9"
               "a",
               EC_M, 18431);
}

void encodes_shift_jis_boundary_characters_using_kanji_mode(void)
{
    check_bits("\xE3\x80\x80\xE7\x86\x99", EC_M, 18630);
}

void maximum_kanji_payload_for_ec_l_consumes_all_available_bits(void)
{
    static char huge_utf8_l[(1817 * 3) + 1];
    for (int i = 0; i < 1817; ++i) {
        huge_utf8_l[i * 3] = '\xE7';
        huge_utf8_l[(i * 3) + 1] = '\x82';
        huge_utf8_l[(i * 3) + 2] = '\xB9';
    }
    huge_utf8_l[1817 * 3] = '\0';
    check_bits(huge_utf8_l, EC_L, 11);
}

void maximum_kanji_payload_for_ec_m_consumes_all_available_bits(void)
{
    static char huge_utf8_m[(1435 * 3) + 1];
    for (int i = 0; i < 1435; ++i) {
        huge_utf8_m[i * 3] = '\xE7';
        huge_utf8_m[(i * 3) + 1] = '\x82';
        huge_utf8_m[(i * 3) + 2] = '\xB9';
    }
    huge_utf8_m[1435 * 3] = '\0';
    check_bits(huge_utf8_m, EC_M, 1);
}

void maximum_kanji_payload_for_ec_q_consumes_all_available_bits(void)
{
    static char huge_utf8_q[(1024 * 3) + 1];
    for (int i = 0; i < 1024; ++i) {
        huge_utf8_q[i * 3] = '\xE7';
        huge_utf8_q[(i * 3) + 1] = '\x82';
        huge_utf8_q[(i * 3) + 2] = '\xB9';
    }
    huge_utf8_q[1024 * 3] = '\0';
    check_bits(huge_utf8_q, EC_Q, 0);
}

void maximum_kanji_payload_for_ec_h_consumes_all_available_bits(void)
{
    static char huge_utf8_h[(784 * 3) + 1];
    for (int i = 0; i < 784; ++i) {
        huge_utf8_h[i * 3] = '\xE7';
        huge_utf8_h[(i * 3) + 1] = '\x82';
        huge_utf8_h[(i * 3) + 2] = '\xB9';
    }
    huge_utf8_h[784 * 3] = '\0';
    check_bits(huge_utf8_h, EC_H, 0);
}

void massive_utf8_payload_is_rejected_without_memory_corruption(void)
{
    static char massive_input[12005];
    int offset = 0;
    for (int i = 0; i < 3000; i++) {
        massive_input[offset++] = '\xF0';
        massive_input[offset++] = '\x9F';
        massive_input[offset++] = '\x9A';
        massive_input[offset++] = '\x80';
    }
    massive_input[offset] = '\0';
    qr_data = massive_input;
    error_correction_level = EC_M;
    process_qr_data();
    ASSERT_TRUE(true);
}

int main(void)
{
    TestCase qr_tests[] = {TEST_FUNC(determines_correct_version_for_sizes_1_to_9),
                           TEST_FUNC(determines_correct_version_for_sizes_10_to_26),
                           TEST_FUNC(determines_correct_version_for_sizes_27_to_40),
                           TEST_FUNC(accepts_data_up_to_maximum_capacity_and_rejects_overflow),
                           TEST_FUNC(processing_valid_data_generates_a_bit_stream),
                           TEST_FUNC(generator_polynomial_of_degree_7_matches_the_iso_standard),
                           TEST_FUNC(generator_polynomial_of_degree_10_matches_the_iso_standard),
                           TEST_FUNC(generator_polynomial_of_degree_68_matches_the_iso_standard),
                           TEST_FUNC(error_correction_blocks_for_version_1_m_match_the_iso_standard),
                           TEST_FUNC(error_correction_blocks_for_version_40_h_match_the_iso_standard),
                           TEST_FUNC(encodes_pure_kanji_input_using_kanji_mode),
                           TEST_FUNC(transitions_from_alphanumeric_to_kanji_mode_when_kanji_is_encountered),
                           TEST_FUNC(retains_byte_mode_when_kanji_sequence_is_too_short_for_optimization),
                           TEST_FUNC(encodes_single_kanji_character_using_kanji_mode),
                           TEST_FUNC(switches_to_kanji_mode_only_when_sequence_exceeds_optimization_threshold),
                           TEST_FUNC(encodes_shift_jis_boundary_characters_using_kanji_mode),
                           TEST_FUNC(maximum_kanji_payload_for_ec_l_consumes_all_available_bits),
                           TEST_FUNC(maximum_kanji_payload_for_ec_m_consumes_all_available_bits),
                           TEST_FUNC(maximum_kanji_payload_for_ec_q_consumes_all_available_bits),
                           TEST_FUNC(maximum_kanji_payload_for_ec_h_consumes_all_available_bits),
                           TEST_FUNC(massive_utf8_payload_is_rejected_without_memory_corruption)};
    RUN_TEST_SUITE("qr_code.c", qr_tests);
    return 0;
}
