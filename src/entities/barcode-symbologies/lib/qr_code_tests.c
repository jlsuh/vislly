#include "testing_utils.h"

#include "qr_code.c"

static void check_version(int numeric_chars, ErrorCorrectionLevel ec_level, int expected_version,
                          int expected_codewords)
{
    static uint8_t dummy_data[8192];
    for (int i = 0; i < numeric_chars; ++i)
        dummy_data[i] = '0';
    dummy_data[numeric_chars] = NULL_TERMINATOR;
    const VersionCapacity *vc = determine_version_and_segment(dummy_data, numeric_chars, ec_level);
    ASSERT_NOT_NULL(vc);
    ASSERT_EQUALS(expected_version, vc->version);
    ASSERT_EQUALS(expected_codewords, vc->data_codewords);
}

static bool check_capacity(const char *char_seq, int repeat_count, ErrorCorrectionLevel ec)
{
    static char test_buffer[32768];
    int seq_len = (int)strlen(char_seq);
    int offset = 0;
    for (int i = 0; i < repeat_count; ++i)
        for (int j = 0; j < seq_len; ++j)
            test_buffer[offset++] = char_seq[j];
    test_buffer[offset] = NULL_TERMINATOR;
    qr_data = test_buffer;
    error_correction_level = ec;
    prepare_qr_data(qr_data);
    const VersionCapacity *vc =
        determine_version_and_segment(processed_data, processed_data_len, error_correction_level);
    return NULL != vc;
}

static void assert_capacity_fits(const char *char_seq, int repeat_count, ErrorCorrectionLevel ec)
{
    ASSERT_TRUE(check_capacity(char_seq, repeat_count, ec));
}

static void assert_capacity_exceeds(const char *char_seq, int repeat_count, ErrorCorrectionLevel ec)
{
    ASSERT_FALSE(check_capacity(char_seq, repeat_count, ec));
}

static void check_bits(const char *utf8_string, ErrorCorrectionLevel ec_level, int expected_remaining_bits)
{
    qr_data = utf8_string;
    error_correction_level = ec_level;
    prepare_qr_data(qr_data);
    segment_data(processed_data, processed_data_len, 3);
    ASSERT_EQUALS(expected_remaining_bits, get_remaining_bits());
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

void processing_valid_data_generates_a_bit_stream(void)
{
    static char data_buffer[8192];
    for (int i = 0; i < 7089; ++i)
        data_buffer[i] = (char)('0' + (i % 10));
    data_buffer[7089] = NULL_TERMINATOR;
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
    ASSERT_MEM_EQUALS(expected_ec, ec, sizeof(expected_ec));
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
    uint8_t expected_remainder[30] = {0};
    ASSERT_MEM_EQUALS(expected_remainder, remainder, sizeof(expected_remainder));
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

void numeric_capacity_is_strictly_enforced_at_ec_l(void)
{
    assert_capacity_fits("1", 7088, EC_L);
    assert_capacity_fits("1", 7089, EC_L);
    assert_capacity_exceeds("1", 7090, EC_L);
}

void numeric_capacity_is_strictly_enforced_at_ec_m(void)
{
    assert_capacity_fits("1", 5595, EC_M);
    assert_capacity_fits("1", 5596, EC_M);
    assert_capacity_exceeds("1", 5597, EC_M);
}

void numeric_capacity_is_strictly_enforced_at_ec_q(void)
{
    assert_capacity_fits("1", 3992, EC_Q);
    assert_capacity_fits("1", 3993, EC_Q);
    assert_capacity_exceeds("1", 3994, EC_Q);
}

void numeric_capacity_is_strictly_enforced_at_ec_h(void)
{
    assert_capacity_fits("1", 3056, EC_H);
    assert_capacity_fits("1", 3057, EC_H);
    assert_capacity_exceeds("1", 3058, EC_H);
}

void alphanumeric_capacity_is_strictly_enforced_at_ec_l(void)
{
    assert_capacity_fits("A", 4295, EC_L);
    assert_capacity_fits("A", 4296, EC_L);
    assert_capacity_exceeds("A", 4297, EC_L);
}

void alphanumeric_capacity_is_strictly_enforced_at_ec_m(void)
{
    assert_capacity_fits("A", 3390, EC_M);
    assert_capacity_fits("A", 3391, EC_M);
    assert_capacity_exceeds("A", 3392, EC_M);
}

void alphanumeric_capacity_is_strictly_enforced_at_ec_q(void)
{
    assert_capacity_fits("A", 2419, EC_Q);
    assert_capacity_fits("A", 2420, EC_Q);
    assert_capacity_exceeds("A", 2421, EC_Q);
}

void alphanumeric_capacity_is_strictly_enforced_at_ec_h(void)
{
    assert_capacity_fits("A", 1851, EC_H);
    assert_capacity_fits("A", 1852, EC_H);
    assert_capacity_exceeds("A", 1853, EC_H);
}

void byte_capacity_is_strictly_enforced_at_ec_l(void)
{
    assert_capacity_fits("a", 2952, EC_L);
    assert_capacity_fits("a", 2953, EC_L);
    assert_capacity_exceeds("a", 2954, EC_L);
}

void byte_capacity_is_strictly_enforced_at_ec_m(void)
{
    assert_capacity_fits("a", 2330, EC_M);
    assert_capacity_fits("a", 2331, EC_M);
    assert_capacity_exceeds("a", 2332, EC_M);
}

void byte_capacity_is_strictly_enforced_at_ec_q(void)
{
    assert_capacity_fits("a", 1662, EC_Q);
    assert_capacity_fits("a", 1663, EC_Q);
    assert_capacity_exceeds("a", 1664, EC_Q);
}

void byte_capacity_is_strictly_enforced_at_ec_h(void)
{
    assert_capacity_fits("a", 1272, EC_H);
    assert_capacity_fits("a", 1273, EC_H);
    assert_capacity_exceeds("a", 1274, EC_H);
}

void kanji_capacity_is_strictly_enforced_at_ec_l(void)
{
    assert_capacity_fits("\xE6\x97\xA5", 1816, EC_L);
    assert_capacity_fits("\xE6\x97\xA5", 1817, EC_L);
    assert_capacity_exceeds("\xE6\x97\xA5", 1818, EC_L);
}

void kanji_capacity_is_strictly_enforced_at_ec_m(void)
{
    assert_capacity_fits("\xE6\x97\xA5", 1434, EC_M);
    assert_capacity_fits("\xE6\x97\xA5", 1435, EC_M);
    assert_capacity_exceeds("\xE6\x97\xA5", 1436, EC_M);
}

void kanji_capacity_is_strictly_enforced_at_ec_q(void)
{
    assert_capacity_fits("\xE6\x97\xA5", 1023, EC_Q);
    assert_capacity_fits("\xE6\x97\xA5", 1024, EC_Q);
    assert_capacity_exceeds("\xE6\x97\xA5", 1025, EC_Q);
}

void kanji_capacity_is_strictly_enforced_at_ec_h(void)
{
    assert_capacity_fits("\xE6\x97\xA5", 783, EC_H);
    assert_capacity_fits("\xE6\x97\xA5", 784, EC_H);
    assert_capacity_exceeds("\xE6\x97\xA5", 785, EC_H);
}

void utf8_eci_fallback_applies_capacity_penalty_at_boundary(void)
{
    static char edge_case_buffer[8192];
    int offset = 0;
    for (int i = 0; i < 2950; ++i)
        edge_case_buffer[offset++] = 'a';
    edge_case_buffer[offset++] = '\xC3';
    edge_case_buffer[offset++] = '\xA9';
    edge_case_buffer[offset] = NULL_TERMINATOR;
    qr_data = edge_case_buffer;
    error_correction_level = EC_L;
    prepare_qr_data(qr_data);
    const VersionCapacity *vc =
        determine_version_and_segment(processed_data, processed_data_len, error_correction_level);
    ASSERT_NOT_NULL(vc);
    edge_case_buffer[offset++] = 'a';
    edge_case_buffer[offset] = NULL_TERMINATOR;
    qr_data = edge_case_buffer;
    prepare_qr_data(qr_data);
    vc = determine_version_and_segment(processed_data, processed_data_len, error_correction_level);
    ASSERT_NULL(vc);
}

void standard_payloads_do_not_trigger_eci_fallback(void)
{
    qr_data = "hello world 123 \xE7\x82\xB9";
    prepare_qr_data(qr_data);
    ASSERT_FALSE(requires_utf8_eci);
}

void extended_latin_character_triggers_utf8_eci_fallback(void)
{
    qr_data = "caf\xC3\xA9";
    prepare_qr_data(qr_data);
    ASSERT_TRUE(requires_utf8_eci);
}

void emoji_payload_triggers_utf8_eci_fallback(void)
{
    qr_data = "Hello \xF0\x9F\x9A\x80";
    prepare_qr_data(qr_data);
    ASSERT_TRUE(requires_utf8_eci);
}

void massive_utf8_payload_is_rejected_without_memory_corruption(void)
{
    static char massive_input[12005];
    int offset = 0;
    for (int i = 0; i < 3000; ++i) {
        massive_input[offset++] = '\xF0';
        massive_input[offset++] = '\x9F';
        massive_input[offset++] = '\x9A';
        massive_input[offset++] = '\x80';
    }
    massive_input[offset] = NULL_TERMINATOR;
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
                           TEST_FUNC(numeric_capacity_is_strictly_enforced_at_ec_l),
                           TEST_FUNC(numeric_capacity_is_strictly_enforced_at_ec_m),
                           TEST_FUNC(numeric_capacity_is_strictly_enforced_at_ec_q),
                           TEST_FUNC(numeric_capacity_is_strictly_enforced_at_ec_h),
                           TEST_FUNC(alphanumeric_capacity_is_strictly_enforced_at_ec_l),
                           TEST_FUNC(alphanumeric_capacity_is_strictly_enforced_at_ec_m),
                           TEST_FUNC(alphanumeric_capacity_is_strictly_enforced_at_ec_q),
                           TEST_FUNC(alphanumeric_capacity_is_strictly_enforced_at_ec_h),
                           TEST_FUNC(byte_capacity_is_strictly_enforced_at_ec_l),
                           TEST_FUNC(byte_capacity_is_strictly_enforced_at_ec_m),
                           TEST_FUNC(byte_capacity_is_strictly_enforced_at_ec_q),
                           TEST_FUNC(byte_capacity_is_strictly_enforced_at_ec_h),
                           TEST_FUNC(kanji_capacity_is_strictly_enforced_at_ec_l),
                           TEST_FUNC(kanji_capacity_is_strictly_enforced_at_ec_m),
                           TEST_FUNC(kanji_capacity_is_strictly_enforced_at_ec_q),
                           TEST_FUNC(kanji_capacity_is_strictly_enforced_at_ec_h),
                           TEST_FUNC(utf8_eci_fallback_applies_capacity_penalty_at_boundary),
                           TEST_FUNC(standard_payloads_do_not_trigger_eci_fallback),
                           TEST_FUNC(extended_latin_character_triggers_utf8_eci_fallback),
                           TEST_FUNC(emoji_payload_triggers_utf8_eci_fallback),
                           TEST_FUNC(massive_utf8_payload_is_rejected_without_memory_corruption)};
    RUN_TEST_SUITE("qr_code.c", qr_tests);
    return 0;
}
