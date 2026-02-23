#include "barcode.h"

#include <stdbool.h>
#include <stdint.h>

#define BITS_PER_BYTE 8
#define MAX_BLOCKS 81
#define MAX_EC_CODEWORDS_PER_BLOCK 68
#define MAX_QR_CODEWORDS 4096
#define VERSION_CAPACITY_LEN 160

#define NUMERIC_CCI_BITS_1_9 10
#define NUMERIC_CCI_BITS_10_26 12
#define NUMERIC_CCI_BITS_27_40 14
#define NUMERIC_GROUP_BITS_1 4
#define NUMERIC_GROUP_BITS_2 7
#define NUMERIC_GROUP_BITS_3 10
#define NUMERIC_GROUP_SIZE 3
#define NUMERIC_MAX_TERMINATOR_LENGTH 4
#define NUMERIC_MODE_BITS 4
#define NUMERIC_MODE_INDICATOR 1

typedef enum { EC_L, EC_M, EC_Q, EC_H } ErrorCorrectionLevel;

typedef struct {
    int version;
    ErrorCorrectionLevel ec_level;
    int data_codewords;
    int num_blocks_g1;
    int c_g1;
    int k_g1;
    int num_blocks_g2;
    int c_g2;
    int k_g2;
} VersionCapacity;

static uint8_t codeword_buffer[MAX_QR_CODEWORDS];
static int global_bit_offset = 0;
static uint8_t interleaved_codewords[MAX_QR_CODEWORDS];

static const char *data;
static ErrorCorrectionLevel error_correction_level;

static const int NUMERIC_MODE_PAD_PATTERN[] = {0xEC, 0x11};

static const VersionCapacity VERSION_CAPACITIES[VERSION_CAPACITY_LEN] = {
    {1, EC_L, 19, 1, 26, 19, 0, 0, 0},
    {1, EC_M, 16, 1, 26, 16, 0, 0, 0},
    {1, EC_Q, 13, 1, 26, 13, 0, 0, 0},
    {1, EC_H, 9, 1, 26, 9, 0, 0, 0},
    {2, EC_L, 34, 1, 44, 34, 0, 0, 0},
    {2, EC_M, 28, 1, 44, 28, 0, 0, 0},
    {2, EC_Q, 22, 1, 44, 22, 0, 0, 0},
    {2, EC_H, 16, 1, 44, 16, 0, 0, 0},
    {3, EC_L, 55, 1, 70, 55, 0, 0, 0},
    {3, EC_M, 44, 1, 70, 44, 0, 0, 0},
    {3, EC_Q, 34, 2, 35, 17, 0, 0, 0},
    {3, EC_H, 26, 2, 35, 13, 0, 0, 0},
    {4, EC_L, 80, 1, 100, 80, 0, 0, 0},
    {4, EC_M, 64, 2, 50, 32, 0, 0, 0},
    {4, EC_Q, 48, 2, 50, 24, 0, 0, 0},
    {4, EC_H, 36, 4, 25, 9, 0, 0, 0},
    {5, EC_L, 108, 1, 134, 108, 0, 0, 0},
    {5, EC_M, 86, 2, 67, 43, 0, 0, 0},
    {5, EC_Q, 62, 2, 33, 15, 2, 34, 16},
    {5, EC_H, 46, 2, 33, 11, 2, 34, 12},
    {6, EC_L, 136, 2, 86, 68, 0, 0, 0},
    {6, EC_M, 108, 4, 43, 27, 0, 0, 0},
    {6, EC_Q, 76, 4, 43, 19, 0, 0, 0},
    {6, EC_H, 60, 4, 43, 15, 0, 0, 0},
    {7, EC_L, 156, 2, 98, 78, 0, 0, 0},
    {7, EC_M, 124, 4, 49, 31, 0, 0, 0},
    {7, EC_Q, 88, 2, 32, 14, 4, 33, 15},
    {7, EC_H, 66, 4, 39, 13, 1, 40, 14},
    {8, EC_L, 194, 2, 121, 97, 0, 0, 0},
    {8, EC_M, 154, 2, 60, 38, 2, 61, 39},
    {8, EC_Q, 110, 4, 40, 18, 2, 41, 19},
    {8, EC_H, 86, 4, 40, 14, 2, 41, 15},
    {9, EC_L, 232, 2, 146, 116, 0, 0, 0},
    {9, EC_M, 182, 3, 58, 36, 2, 59, 37},
    {9, EC_Q, 132, 4, 36, 16, 4, 37, 17},
    {9, EC_H, 100, 4, 36, 12, 4, 37, 13},
    {10, EC_L, 274, 2, 86, 68, 2, 87, 69},
    {10, EC_M, 216, 4, 69, 43, 1, 70, 44},
    {10, EC_Q, 154, 6, 43, 19, 2, 44, 20},
    {10, EC_H, 122, 6, 43, 15, 2, 44, 16},
    {11, EC_L, 324, 4, 101, 81, 0, 0, 0},
    {11, EC_M, 254, 1, 80, 50, 4, 81, 51},
    {11, EC_Q, 180, 4, 50, 22, 4, 51, 23},
    {11, EC_H, 140, 3, 36, 12, 8, 37, 13},
    {12, EC_L, 370, 2, 116, 92, 2, 117, 93},
    {12, EC_M, 290, 6, 58, 36, 2, 59, 37},
    {12, EC_Q, 206, 4, 46, 20, 6, 47, 21},
    {12, EC_H, 158, 7, 42, 14, 4, 43, 15},
    {13, EC_L, 428, 4, 133, 107, 0, 0, 0},
    {13, EC_M, 334, 8, 59, 37, 1, 60, 38},
    {13, EC_Q, 244, 8, 44, 20, 4, 45, 21},
    {13, EC_H, 180, 12, 33, 11, 4, 34, 12},
    {14, EC_L, 461, 3, 145, 115, 1, 146, 116},
    {14, EC_M, 365, 4, 64, 40, 5, 65, 41},
    {14, EC_Q, 261, 11, 36, 16, 5, 37, 17},
    {14, EC_H, 197, 11, 36, 12, 5, 37, 13},
    {15, EC_L, 523, 5, 109, 87, 1, 110, 88},
    {15, EC_M, 415, 5, 65, 41, 5, 66, 42},
    {15, EC_Q, 295, 5, 54, 24, 7, 55, 25},
    {15, EC_H, 223, 11, 36, 12, 7, 37, 13},
    {16, EC_L, 589, 5, 122, 98, 1, 123, 99},
    {16, EC_M, 453, 7, 73, 45, 3, 74, 46},
    {16, EC_Q, 325, 15, 43, 19, 2, 44, 20},
    {16, EC_H, 253, 3, 45, 15, 13, 46, 16},
    {17, EC_L, 647, 1, 135, 107, 5, 136, 108},
    {17, EC_M, 507, 10, 74, 46, 1, 75, 47},
    {17, EC_Q, 367, 1, 50, 22, 15, 51, 23},
    {17, EC_H, 283, 2, 42, 14, 17, 43, 15},
    {18, EC_L, 721, 5, 150, 120, 1, 151, 121},
    {18, EC_M, 563, 9, 69, 43, 4, 70, 44},
    {18, EC_Q, 397, 17, 50, 22, 1, 51, 23},
    {18, EC_H, 313, 2, 42, 14, 19, 43, 15},
    {19, EC_L, 795, 3, 141, 113, 4, 142, 114},
    {19, EC_M, 627, 3, 70, 44, 11, 71, 45},
    {19, EC_Q, 445, 17, 47, 21, 4, 48, 22},
    {19, EC_H, 341, 9, 39, 13, 16, 40, 14},
    {20, EC_L, 861, 3, 135, 107, 5, 136, 108},
    {20, EC_M, 669, 3, 67, 41, 13, 68, 42},
    {20, EC_Q, 485, 15, 54, 24, 5, 55, 25},
    {20, EC_H, 385, 15, 43, 15, 10, 44, 16},
    {21, EC_L, 932, 4, 144, 116, 4, 145, 117},
    {21, EC_M, 757, 17, 68, 42, 1, 69, 43},
    {21, EC_Q, 512, 17, 50, 22, 6, 51, 23},
    {21, EC_H, 406, 19, 46, 16, 6, 47, 17},
    {22, EC_L, 1006, 2, 139, 111, 7, 140, 112},
    {22, EC_M, 782, 17, 74, 46, 0, 0, 0},
    {22, EC_Q, 568, 7, 54, 24, 16, 55, 25},
    {22, EC_H, 442, 34, 37, 13, 0, 0, 0},
    {23, EC_L, 1094, 4, 151, 121, 5, 152, 122},
    {23, EC_M, 860, 4, 75, 47, 14, 76, 48},
    {23, EC_Q, 614, 11, 54, 24, 16, 55, 25},
    {23, EC_H, 464, 16, 45, 15, 14, 46, 16},
    {24, EC_L, 1174, 6, 147, 117, 4, 148, 118},
    {24, EC_M, 914, 6, 73, 45, 14, 74, 46},
    {24, EC_Q, 664, 11, 54, 24, 16, 55, 25},
    {24, EC_H, 514, 30, 46, 16, 2, 47, 17},
    {25, EC_L, 1276, 8, 132, 106, 4, 133, 107},
    {25, EC_M, 1000, 8, 75, 47, 13, 76, 48},
    {25, EC_Q, 718, 7, 54, 24, 22, 55, 25},
    {25, EC_H, 538, 22, 45, 15, 13, 46, 16},
    {26, EC_L, 1370, 10, 142, 114, 2, 143, 115},
    {26, EC_M, 1062, 19, 74, 46, 4, 75, 47},
    {26, EC_Q, 754, 28, 50, 22, 6, 51, 23},
    {26, EC_H, 596, 33, 46, 16, 4, 47, 17},
    {27, EC_L, 1468, 8, 152, 122, 4, 153, 123},
    {27, EC_M, 1128, 22, 73, 45, 3, 74, 46},
    {27, EC_Q, 808, 8, 53, 23, 26, 54, 24},
    {27, EC_H, 628, 12, 45, 15, 28, 46, 16},
    {28, EC_L, 1531, 3, 147, 117, 10, 148, 118},
    {28, EC_M, 1193, 3, 73, 45, 23, 74, 46},
    {28, EC_Q, 871, 4, 54, 24, 31, 55, 25},
    {28, EC_H, 661, 11, 45, 15, 31, 46, 16},
    {29, EC_L, 1631, 7, 146, 116, 7, 147, 117},
    {29, EC_M, 1267, 21, 73, 45, 7, 74, 46},
    {29, EC_Q, 911, 1, 53, 23, 37, 54, 24},
    {29, EC_H, 701, 19, 45, 15, 26, 46, 16},
    {30, EC_L, 1735, 5, 145, 115, 10, 146, 116},
    {30, EC_M, 1373, 19, 75, 47, 10, 76, 48},
    {30, EC_Q, 985, 15, 54, 24, 25, 55, 25},
    {30, EC_H, 745, 23, 45, 15, 25, 46, 16},
    {31, EC_L, 1843, 13, 145, 115, 3, 146, 116},
    {31, EC_M, 1455, 2, 74, 46, 29, 75, 47},
    {31, EC_Q, 1033, 42, 54, 24, 1, 55, 25},
    {31, EC_H, 793, 23, 45, 15, 28, 46, 16},
    {32, EC_L, 1955, 17, 145, 115, 0, 0, 0},
    {32, EC_M, 1541, 10, 74, 46, 23, 75, 47},
    {32, EC_Q, 1115, 10, 54, 24, 35, 55, 25},
    {32, EC_H, 845, 19, 45, 15, 35, 46, 16},
    {33, EC_L, 2071, 17, 145, 115, 1, 146, 116},
    {33, EC_M, 1631, 14, 74, 46, 21, 75, 47},
    {33, EC_Q, 1171, 29, 54, 24, 19, 55, 25},
    {33, EC_H, 901, 11, 45, 15, 46, 46, 16},
    {34, EC_L, 2191, 13, 145, 115, 6, 146, 116},
    {34, EC_M, 1725, 14, 74, 46, 23, 75, 47},
    {34, EC_Q, 1231, 44, 54, 24, 7, 55, 25},
    {34, EC_H, 961, 59, 46, 16, 1, 47, 17},
    {35, EC_L, 2306, 12, 151, 121, 7, 152, 122},
    {35, EC_M, 1812, 12, 75, 47, 26, 76, 48},
    {35, EC_Q, 1286, 39, 54, 24, 14, 55, 25},
    {35, EC_H, 986, 22, 45, 15, 41, 46, 16},
    {36, EC_L, 2434, 6, 151, 121, 14, 152, 122},
    {36, EC_M, 1914, 6, 75, 47, 34, 76, 48},
    {36, EC_Q, 1354, 46, 54, 24, 10, 55, 25},
    {36, EC_H, 1054, 2, 45, 15, 64, 46, 16},
    {37, EC_L, 2566, 17, 152, 122, 4, 153, 123},
    {37, EC_M, 1992, 29, 74, 46, 14, 75, 47},
    {37, EC_Q, 1426, 49, 54, 24, 10, 55, 25},
    {37, EC_H, 1096, 24, 45, 15, 46, 46, 16},
    {38, EC_L, 2702, 4, 152, 122, 18, 153, 123},
    {38, EC_M, 2102, 13, 74, 46, 32, 75, 47},
    {38, EC_Q, 1502, 48, 54, 24, 14, 55, 25},
    {38, EC_H, 1142, 42, 45, 15, 32, 46, 16},
    {39, EC_L, 2812, 20, 147, 117, 4, 148, 118},
    {39, EC_M, 2216, 40, 75, 47, 7, 76, 48},
    {39, EC_Q, 1582, 43, 54, 24, 22, 55, 25},
    {39, EC_H, 1222, 10, 45, 15, 67, 46, 16},
    {40, EC_L, 2956, 19, 148, 118, 6, 149, 119},
    {40, EC_M, 2334, 18, 75, 47, 31, 76, 48},
    {40, EC_Q, 1666, 34, 54, 24, 34, 55, 25},
    {40, EC_H, 1276, 20, 45, 15, 61, 46, 16}};

static uint8_t gf_ilog[512];
static uint8_t gf_log[256];
static bool gf_initialized = false;

/**
 * @brief Initializes log and inverse log tables for Galois Field GF(2^8).
 * Primitive polynomial g(x) = x^8 + x^4 + x^3 + x^2 + 1 (0x11D) and primitive
 * element α = 2 are both used to populate the tables.
 * @see
 * https://people.computing.clemson.edu/~jmarty/papers/IntroToGaloisFieldsAndRSCoding.pdf
 */
static void init_gf_tables(void)
{
    if (gf_initialized)
        return;
    int x = 1;
    for (uint8_t i = 0; i < 255; ++i) {
        gf_ilog[i] = (uint8_t)x;
        gf_log[x] = i;
        x <<= 1;
        if (x & 0x100)
            x ^= 0x11D;
    }
    for (size_t i = 255; i < 512; ++i)
        gf_ilog[i] = gf_ilog[i - 255];
    gf_initialized = true;
}

static inline uint8_t gf_mul(uint8_t x, uint8_t y)
{
    if (x == 0 || y == 0)
        return 0;
    return gf_ilog[gf_log[x] + gf_log[y]];
}

static const uint8_t *compute_generator_poly(int ec_block_len)
{
    static uint8_t g[MAX_EC_CODEWORDS_PER_BLOCK + 1];
    g[0] = 1;
    for (int i = 0; i < ec_block_len; ++i) {
        uint8_t root = gf_ilog[i];
        g[i + 1] = gf_mul(g[i], root);
        for (int j = i; j > 0; --j)
            g[j] = g[j] ^ gf_mul(g[j - 1], root);
    }
    return g;
}

static void encode_reed_solomon_block(const uint8_t *data_block, int data_len,
                                      const uint8_t *g, int ec_len, uint8_t *ec)
{
    for (int i = 0; i < ec_len; ++i)
        ec[i] = 0;
    for (int i = 0; i < data_len; ++i) {
        uint8_t feedback = data_block[i] ^ ec[0];
        for (int j = 0; j < ec_len - 1; ++j)
            ec[j] = ec[j + 1];
        ec[ec_len - 1] = 0;
        if (feedback != 0)
            for (int j = 0; j < ec_len; ++j)
                ec[j] ^= gf_mul(feedback, g[j + 1]);
    }
}

static void generate_interleaved_message(const uint8_t *data_codewords,
                                         const VersionCapacity *vc)
{
    int total_blocks = vc->num_blocks_g1 + vc->num_blocks_g2;
    const uint8_t *data_blocks[MAX_BLOCKS];
    uint8_t ec_blocks[MAX_BLOCKS][MAX_EC_CODEWORDS_PER_BLOCK];
    const uint8_t *ec_blocks_ptrs[MAX_BLOCKS];
    int data_offset = 0;
    int max_data_len = 0;
    int max_ec_len = 0;
    for (int b = 0; b < total_blocks; ++b) {
        int data_block_len;
        int ec_block_len;
        if (b < vc->num_blocks_g1) {
            data_block_len = vc->k_g1;
            ec_block_len = vc->c_g1 - vc->k_g1;
        } else {
            data_block_len = vc->k_g2;
            ec_block_len = vc->c_g2 - vc->k_g2;
        }
        data_blocks[b] = &data_codewords[data_offset];
        ec_blocks_ptrs[b] = ec_blocks[b];
        const uint8_t *g = compute_generator_poly(ec_block_len);
        encode_reed_solomon_block(data_blocks[b], data_block_len, g,
                                  ec_block_len, ec_blocks[b]);
        if (data_block_len > max_data_len)
            max_data_len = data_block_len;
        if (ec_block_len > max_ec_len)
            max_ec_len = ec_block_len;
        data_offset += data_block_len;
    }
    int len = 0;
    for (int col = 0; col < max_data_len; ++col) {
        for (int b = 0; b < total_blocks; ++b) {
            int data_block_len = (b < vc->num_blocks_g1) ? vc->k_g1 : vc->k_g2;
            if (col < data_block_len)
                interleaved_codewords[len++] = data_blocks[b][col];
        }
    }
    for (int col = 0; col < max_ec_len; ++col) {
        for (int b = 0; b < total_blocks; ++b) {
            int ec_block_len = (b < vc->num_blocks_g1) ? vc->c_g1 - vc->k_g1
                                                       : vc->c_g2 - vc->k_g2;
            if (col < ec_block_len)
                interleaved_codewords[len++] = ec_blocks[b][col];
        }
    }
}

static const VersionCapacity *
get_version_capacity(int version, ErrorCorrectionLevel ec_level)
{
    for (int i = 0; i < VERSION_CAPACITY_LEN; ++i)
        if (VERSION_CAPACITIES[i].version == version &&
            VERSION_CAPACITIES[i].ec_level == ec_level)
            return &VERSION_CAPACITIES[i];
    return NULL;
}

static inline void append_bits(int value, int bit_count)
{
    for (int i = bit_count - 1; i >= 0; --i) {
        int bit = (value >> i) & 1;
        int byte_idx = global_bit_offset / BITS_PER_BYTE;
        int bit_idx = (BITS_PER_BYTE - 1) - (global_bit_offset % BITS_PER_BYTE);
        if (bit)
            codeword_buffer[byte_idx] |= (1 << bit_idx);
        ++global_bit_offset;
    }
}

static inline int numeric_get_group_size(int remaining_digits)
{
    if (remaining_digits >= NUMERIC_GROUP_SIZE)
        return NUMERIC_GROUP_SIZE;
    return remaining_digits;
}

static inline int numeric_get_bit_count_for_group(int group_len)
{
    if (group_len == 3)
        return NUMERIC_GROUP_BITS_3;
    if (group_len == 2)
        return NUMERIC_GROUP_BITS_2;
    return NUMERIC_GROUP_BITS_1;
}

static inline int numeric_get_terminator_length(int remaining_bits)
{
    if (remaining_bits > NUMERIC_MAX_TERMINATOR_LENGTH)
        return NUMERIC_MAX_TERMINATOR_LENGTH;
    return remaining_bits;
}

static inline int numeric_get_cci_bits(int version)
{
    if (version < 10)
        return NUMERIC_CCI_BITS_1_9;
    if (version < 27)
        return NUMERIC_CCI_BITS_10_26;
    return NUMERIC_CCI_BITS_27_40;
}

static inline int numeric_get_content_bits(int len)
{
    int groups_of_three = len / NUMERIC_GROUP_SIZE;
    int remaining_digits = len % NUMERIC_GROUP_SIZE;
    int total_bits = groups_of_three * NUMERIC_GROUP_BITS_3;
    if (remaining_digits == 2)
        total_bits += NUMERIC_GROUP_BITS_2;
    else if (remaining_digits == 1)
        total_bits += NUMERIC_GROUP_BITS_1;
    return total_bits;
}

static inline void numeric_encode_segment_data(const char *const data, int len)
{
    for (int i = 0; i < len; i += NUMERIC_GROUP_SIZE) {
        int remaining_digits = len - i;
        int group_len = numeric_get_group_size(remaining_digits);
        int value = 0;
        for (int j = 0; j < group_len; ++j)
            value = (value * 10) + char_to_digit(data[i + j]);
        int bit_count = numeric_get_bit_count_for_group(group_len);
        append_bits(value, bit_count);
    }
}

static inline void numeric_append_terminator(int target_codewords)
{
    int max_capacity_bits = target_codewords * BITS_PER_BYTE;
    int remaining_bits = max_capacity_bits - global_bit_offset;
    int terminator_len = numeric_get_terminator_length(remaining_bits);
    append_bits(0, terminator_len);
}

static inline void numeric_append_padding_bits(void)
{
    int padding_bits =
        (BITS_PER_BYTE - (global_bit_offset % BITS_PER_BYTE)) % BITS_PER_BYTE;
    append_bits(0, padding_bits);
}

static inline void numeric_append_pad_codewords(int target_codewords)
{
    int pad_bytes_needed =
        target_codewords - (global_bit_offset / BITS_PER_BYTE);
    for (int i = 0; i < pad_bytes_needed; ++i)
        append_bits(NUMERIC_MODE_PAD_PATTERN[i % 2], BITS_PER_BYTE);
}

static bool determine_version(int content_bits, ErrorCorrectionLevel ec_level,
                              int *out_version, int *out_codewords,
                              int *out_cci_bits)
{
    for (int i = 0; i < VERSION_CAPACITY_LEN; ++i) {
        if (VERSION_CAPACITIES[i].ec_level == ec_level) {
            int version = VERSION_CAPACITIES[i].version;
            int capacity_bits =
                VERSION_CAPACITIES[i].data_codewords * BITS_PER_BYTE;
            int cci_bits = numeric_get_cci_bits(version);
            int data_bits = NUMERIC_MODE_BITS + cci_bits + content_bits;
            if (data_bits <= capacity_bits) {
                *out_version = version;
                *out_codewords = VERSION_CAPACITIES[i].data_codewords;
                *out_cci_bits = cci_bits;
                return true;
            }
        }
    }
    return false;
}

void process_qr_data(void)
{
    init_gf_tables();
    int len = wasm_strlen(data);
    int content_bits = numeric_get_content_bits(len);
    int target_version = -1;
    int target_codewords = -1;
    int target_cci_length = -1;
    if (!determine_version(content_bits, error_correction_level,
                           &target_version, &target_codewords,
                           &target_cci_length)) {
        return;
    }
    global_bit_offset = 0;
    wasm_memset(codeword_buffer, 0, sizeof(codeword_buffer));
    append_bits(NUMERIC_MODE_INDICATOR, NUMERIC_MODE_BITS);
    append_bits(len, target_cci_length);
    numeric_encode_segment_data(data, len);
    numeric_append_terminator(target_codewords);
    numeric_append_padding_bits();
    numeric_append_pad_codewords(target_codewords);
    const VersionCapacity *vc =
        get_version_capacity(target_version, error_correction_level);
    if (vc != NULL) {
        generate_interleaved_message(codeword_buffer, vc);
    }
}

void render(void)
{
}
