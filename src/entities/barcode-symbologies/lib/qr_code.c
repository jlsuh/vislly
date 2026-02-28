#include "barcode.h"

#include <stdbool.h>
#include <stdint.h>

#define MAX_QR_MODULES 177
#define MODULE_BASE_SIZE 4
#define QUIET_ZONE_MULTIPLIER 4

#define ALIGNMENT_PATTERN_CENTER_OFFSET 2
#define ALIGNMENT_PATTERN_SIZE 5
#define FINDER_PATTERN_AREA_SIZE 8
#define FINDER_PATTERN_INNER_OFFSET 2
#define FINDER_PATTERN_INNER_SIZE 3
#define FINDER_PATTERN_SIZE 7
#define MAX_ALIGNMENT_COORDS 7
#define NO_ALIGNMENT_VERSION 1
#define TIMING_PATTERN_COORD 6
#define TIMING_PATTERN_END_MARGIN 9

#define BITS_PER_BYTE 8
#define MAX_BLOCKS 81
#define MAX_EC_CODEWORDS_PER_BLOCK 68
#define MAX_QR_CODEWORDS 4096
#define QR_VERSION_COUNT 41
#define VERSION_CAPACITY_LEN 160

#define FORMAT_INFO_BITS 15
#define FORMAT_INFO_COORD 8
#define FORMAT_INFO_MASK_PATTERN 0x5412
#define FORMAT_INFO_POLY 0x537
#define VERSION_INFO_BITS 18
#define VERSION_INFO_EDGE_OFFSET 11
#define VERSION_INFO_MAX_COORD 5
#define VERSION_INFO_MIN_VERSION 7
#define VERSION_INFO_POLY 0x1F25
#define VERSION_MODULES_BASE 17
#define VERSION_MODULES_STEP 4

#define PENALTY_N1 3
#define PENALTY_N2 3
#define PENALTY_N3 40
#define PENALTY_N4 10

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

#define DIRECTION_UP -1

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

typedef struct {
    Canvas *canvas;
    const VersionCapacity *vc;
    int version;
    int grid_dim;
    int quiet_zone_width;
    int mask_pattern;
    ErrorCorrectionLevel ec_level;
} QRContext;

typedef struct {
    int grid_dim;
    int version;
    int row;
    int col;
    int dir;
    int step_row;
    int step_col;
} QRZigZag;

typedef struct {
    const uint8_t *data;
    uint8_t *ec;
    int data_len;
    int ec_len;
} RSBlock;

typedef bool (*MaskEvaluator)(int, int);

static uint8_t codeword_buffer[MAX_QR_CODEWORDS];
static int global_bit_offset = 0;
static uint8_t interleaved_codewords[MAX_QR_CODEWORDS];

static const char *data;
static ErrorCorrectionLevel error_correction_level;

static uint8_t eval_base_grid[MAX_QR_MODULES][MAX_QR_MODULES];
static uint8_t eval_grid[MAX_QR_MODULES][MAX_QR_MODULES];

static int module_size = 0;

static const int EC_FORMAT_BITS[] = {1, 0, 3, 2};
static const int FORMAT_INFO_COL[FORMAT_INFO_BITS] = {0, 1, 2, 3, 4, 5, 7, 8, 8, 8, 8, 8, 8, 8, 8};
static const int FORMAT_INFO_ROW[FORMAT_INFO_BITS] = {8, 8, 8, 8, 8, 8, 8, 8, 7, 5, 4, 3, 2, 1, 0};
static const int NUMERIC_MODE_PAD_PATTERN[] = {0xEC, 0x11};
static const uint8_t PENALTY_RULE_3_PATTERN[7] = {1, 0, 1, 1, 1, 0, 1};

static const VersionCapacity VERSION_CAPACITIES[VERSION_CAPACITY_LEN] = {
    {1,  EC_L, 19,   1,  26,  19,  0,  0,   0  },
    {1,  EC_M, 16,   1,  26,  16,  0,  0,   0  },
    {1,  EC_Q, 13,   1,  26,  13,  0,  0,   0  },
    {1,  EC_H, 9,    1,  26,  9,   0,  0,   0  },
    {2,  EC_L, 34,   1,  44,  34,  0,  0,   0  },
    {2,  EC_M, 28,   1,  44,  28,  0,  0,   0  },
    {2,  EC_Q, 22,   1,  44,  22,  0,  0,   0  },
    {2,  EC_H, 16,   1,  44,  16,  0,  0,   0  },
    {3,  EC_L, 55,   1,  70,  55,  0,  0,   0  },
    {3,  EC_M, 44,   1,  70,  44,  0,  0,   0  },
    {3,  EC_Q, 34,   2,  35,  17,  0,  0,   0  },
    {3,  EC_H, 26,   2,  35,  13,  0,  0,   0  },
    {4,  EC_L, 80,   1,  100, 80,  0,  0,   0  },
    {4,  EC_M, 64,   2,  50,  32,  0,  0,   0  },
    {4,  EC_Q, 48,   2,  50,  24,  0,  0,   0  },
    {4,  EC_H, 36,   4,  25,  9,   0,  0,   0  },
    {5,  EC_L, 108,  1,  134, 108, 0,  0,   0  },
    {5,  EC_M, 86,   2,  67,  43,  0,  0,   0  },
    {5,  EC_Q, 62,   2,  33,  15,  2,  34,  16 },
    {5,  EC_H, 46,   2,  33,  11,  2,  34,  12 },
    {6,  EC_L, 136,  2,  86,  68,  0,  0,   0  },
    {6,  EC_M, 108,  4,  43,  27,  0,  0,   0  },
    {6,  EC_Q, 76,   4,  43,  19,  0,  0,   0  },
    {6,  EC_H, 60,   4,  43,  15,  0,  0,   0  },
    {7,  EC_L, 156,  2,  98,  78,  0,  0,   0  },
    {7,  EC_M, 124,  4,  49,  31,  0,  0,   0  },
    {7,  EC_Q, 88,   2,  32,  14,  4,  33,  15 },
    {7,  EC_H, 66,   4,  39,  13,  1,  40,  14 },
    {8,  EC_L, 194,  2,  121, 97,  0,  0,   0  },
    {8,  EC_M, 154,  2,  60,  38,  2,  61,  39 },
    {8,  EC_Q, 110,  4,  40,  18,  2,  41,  19 },
    {8,  EC_H, 86,   4,  40,  14,  2,  41,  15 },
    {9,  EC_L, 232,  2,  146, 116, 0,  0,   0  },
    {9,  EC_M, 182,  3,  58,  36,  2,  59,  37 },
    {9,  EC_Q, 132,  4,  36,  16,  4,  37,  17 },
    {9,  EC_H, 100,  4,  36,  12,  4,  37,  13 },
    {10, EC_L, 274,  2,  86,  68,  2,  87,  69 },
    {10, EC_M, 216,  4,  69,  43,  1,  70,  44 },
    {10, EC_Q, 154,  6,  43,  19,  2,  44,  20 },
    {10, EC_H, 122,  6,  43,  15,  2,  44,  16 },
    {11, EC_L, 324,  4,  101, 81,  0,  0,   0  },
    {11, EC_M, 254,  1,  80,  50,  4,  81,  51 },
    {11, EC_Q, 180,  4,  50,  22,  4,  51,  23 },
    {11, EC_H, 140,  3,  36,  12,  8,  37,  13 },
    {12, EC_L, 370,  2,  116, 92,  2,  117, 93 },
    {12, EC_M, 290,  6,  58,  36,  2,  59,  37 },
    {12, EC_Q, 206,  4,  46,  20,  6,  47,  21 },
    {12, EC_H, 158,  7,  42,  14,  4,  43,  15 },
    {13, EC_L, 428,  4,  133, 107, 0,  0,   0  },
    {13, EC_M, 334,  8,  59,  37,  1,  60,  38 },
    {13, EC_Q, 244,  8,  44,  20,  4,  45,  21 },
    {13, EC_H, 180,  12, 33,  11,  4,  34,  12 },
    {14, EC_L, 461,  3,  145, 115, 1,  146, 116},
    {14, EC_M, 365,  4,  64,  40,  5,  65,  41 },
    {14, EC_Q, 261,  11, 36,  16,  5,  37,  17 },
    {14, EC_H, 197,  11, 36,  12,  5,  37,  13 },
    {15, EC_L, 523,  5,  109, 87,  1,  110, 88 },
    {15, EC_M, 415,  5,  65,  41,  5,  66,  42 },
    {15, EC_Q, 295,  5,  54,  24,  7,  55,  25 },
    {15, EC_H, 223,  11, 36,  12,  7,  37,  13 },
    {16, EC_L, 589,  5,  122, 98,  1,  123, 99 },
    {16, EC_M, 453,  7,  73,  45,  3,  74,  46 },
    {16, EC_Q, 325,  15, 43,  19,  2,  44,  20 },
    {16, EC_H, 253,  3,  45,  15,  13, 46,  16 },
    {17, EC_L, 647,  1,  135, 107, 5,  136, 108},
    {17, EC_M, 507,  10, 74,  46,  1,  75,  47 },
    {17, EC_Q, 367,  1,  50,  22,  15, 51,  23 },
    {17, EC_H, 283,  2,  42,  14,  17, 43,  15 },
    {18, EC_L, 721,  5,  150, 120, 1,  151, 121},
    {18, EC_M, 563,  9,  69,  43,  4,  70,  44 },
    {18, EC_Q, 397,  17, 50,  22,  1,  51,  23 },
    {18, EC_H, 313,  2,  42,  14,  19, 43,  15 },
    {19, EC_L, 795,  3,  141, 113, 4,  142, 114},
    {19, EC_M, 627,  3,  70,  44,  11, 71,  45 },
    {19, EC_Q, 445,  17, 47,  21,  4,  48,  22 },
    {19, EC_H, 341,  9,  39,  13,  16, 40,  14 },
    {20, EC_L, 861,  3,  135, 107, 5,  136, 108},
    {20, EC_M, 669,  3,  67,  41,  13, 68,  42 },
    {20, EC_Q, 485,  15, 54,  24,  5,  55,  25 },
    {20, EC_H, 385,  15, 43,  15,  10, 44,  16 },
    {21, EC_L, 932,  4,  144, 116, 4,  145, 117},
    {21, EC_M, 757,  17, 68,  42,  1,  69,  43 },
    {21, EC_Q, 512,  17, 50,  22,  6,  51,  23 },
    {21, EC_H, 406,  19, 46,  16,  6,  47,  17 },
    {22, EC_L, 1006, 2,  139, 111, 7,  140, 112},
    {22, EC_M, 782,  17, 74,  46,  0,  0,   0  },
    {22, EC_Q, 568,  7,  54,  24,  16, 55,  25 },
    {22, EC_H, 442,  34, 37,  13,  0,  0,   0  },
    {23, EC_L, 1094, 4,  151, 121, 5,  152, 122},
    {23, EC_M, 860,  4,  75,  47,  14, 76,  48 },
    {23, EC_Q, 614,  11, 54,  24,  16, 55,  25 },
    {23, EC_H, 464,  16, 45,  15,  14, 46,  16 },
    {24, EC_L, 1174, 6,  147, 117, 4,  148, 118},
    {24, EC_M, 914,  6,  73,  45,  14, 74,  46 },
    {24, EC_Q, 664,  11, 54,  24,  16, 55,  25 },
    {24, EC_H, 514,  30, 46,  16,  2,  47,  17 },
    {25, EC_L, 1276, 8,  132, 106, 4,  133, 107},
    {25, EC_M, 1000, 8,  75,  47,  13, 76,  48 },
    {25, EC_Q, 718,  7,  54,  24,  22, 55,  25 },
    {25, EC_H, 538,  22, 45,  15,  13, 46,  16 },
    {26, EC_L, 1370, 10, 142, 114, 2,  143, 115},
    {26, EC_M, 1062, 19, 74,  46,  4,  75,  47 },
    {26, EC_Q, 754,  28, 50,  22,  6,  51,  23 },
    {26, EC_H, 596,  33, 46,  16,  4,  47,  17 },
    {27, EC_L, 1468, 8,  152, 122, 4,  153, 123},
    {27, EC_M, 1128, 22, 73,  45,  3,  74,  46 },
    {27, EC_Q, 808,  8,  53,  23,  26, 54,  24 },
    {27, EC_H, 628,  12, 45,  15,  28, 46,  16 },
    {28, EC_L, 1531, 3,  147, 117, 10, 148, 118},
    {28, EC_M, 1193, 3,  73,  45,  23, 74,  46 },
    {28, EC_Q, 871,  4,  54,  24,  31, 55,  25 },
    {28, EC_H, 661,  11, 45,  15,  31, 46,  16 },
    {29, EC_L, 1631, 7,  146, 116, 7,  147, 117},
    {29, EC_M, 1267, 21, 73,  45,  7,  74,  46 },
    {29, EC_Q, 911,  1,  53,  23,  37, 54,  24 },
    {29, EC_H, 701,  19, 45,  15,  26, 46,  16 },
    {30, EC_L, 1735, 5,  145, 115, 10, 146, 116},
    {30, EC_M, 1373, 19, 75,  47,  10, 76,  48 },
    {30, EC_Q, 985,  15, 54,  24,  25, 55,  25 },
    {30, EC_H, 745,  23, 45,  15,  25, 46,  16 },
    {31, EC_L, 1843, 13, 145, 115, 3,  146, 116},
    {31, EC_M, 1455, 2,  74,  46,  29, 75,  47 },
    {31, EC_Q, 1033, 42, 54,  24,  1,  55,  25 },
    {31, EC_H, 793,  23, 45,  15,  28, 46,  16 },
    {32, EC_L, 1955, 17, 145, 115, 0,  0,   0  },
    {32, EC_M, 1541, 10, 74,  46,  23, 75,  47 },
    {32, EC_Q, 1115, 10, 54,  24,  35, 55,  25 },
    {32, EC_H, 845,  19, 45,  15,  35, 46,  16 },
    {33, EC_L, 2071, 17, 145, 115, 1,  146, 116},
    {33, EC_M, 1631, 14, 74,  46,  21, 75,  47 },
    {33, EC_Q, 1171, 29, 54,  24,  19, 55,  25 },
    {33, EC_H, 901,  11, 45,  15,  46, 46,  16 },
    {34, EC_L, 2191, 13, 145, 115, 6,  146, 116},
    {34, EC_M, 1725, 14, 74,  46,  23, 75,  47 },
    {34, EC_Q, 1231, 44, 54,  24,  7,  55,  25 },
    {34, EC_H, 961,  59, 46,  16,  1,  47,  17 },
    {35, EC_L, 2306, 12, 151, 121, 7,  152, 122},
    {35, EC_M, 1812, 12, 75,  47,  26, 76,  48 },
    {35, EC_Q, 1286, 39, 54,  24,  14, 55,  25 },
    {35, EC_H, 986,  22, 45,  15,  41, 46,  16 },
    {36, EC_L, 2434, 6,  151, 121, 14, 152, 122},
    {36, EC_M, 1914, 6,  75,  47,  34, 76,  48 },
    {36, EC_Q, 1354, 46, 54,  24,  10, 55,  25 },
    {36, EC_H, 1054, 2,  45,  15,  64, 46,  16 },
    {37, EC_L, 2566, 17, 152, 122, 4,  153, 123},
    {37, EC_M, 1992, 29, 74,  46,  14, 75,  47 },
    {37, EC_Q, 1426, 49, 54,  24,  10, 55,  25 },
    {37, EC_H, 1096, 24, 45,  15,  46, 46,  16 },
    {38, EC_L, 2702, 4,  152, 122, 18, 153, 123},
    {38, EC_M, 2102, 13, 74,  46,  32, 75,  47 },
    {38, EC_Q, 1502, 48, 54,  24,  14, 55,  25 },
    {38, EC_H, 1142, 42, 45,  15,  32, 46,  16 },
    {39, EC_L, 2812, 20, 147, 117, 4,  148, 118},
    {39, EC_M, 2216, 40, 75,  47,  7,  76,  48 },
    {39, EC_Q, 1582, 43, 54,  24,  22, 55,  25 },
    {39, EC_H, 1222, 10, 45,  15,  67, 46,  16 },
    {40, EC_L, 2956, 19, 148, 118, 6,  149, 119},
    {40, EC_M, 2334, 18, 75,  47,  31, 76,  48 },
    {40, EC_Q, 1666, 34, 54,  24,  34, 55,  25 },
    {40, EC_H, 1276, 20, 45,  15,  61, 46,  16 }
};

static const int ALIGNMENT_PATTERN_COORDS[QR_VERSION_COUNT][MAX_ALIGNMENT_COORDS] = {
    {0},
    {0},
    {6, 18},
    {6, 22},
    {6, 26},
    {6, 30},
    {6, 34},
    {6, 22, 38},
    {6, 24, 42},
    {6, 26, 46},
    {6, 28, 50},
    {6, 30, 54},
    {6, 32, 58},
    {6, 34, 62},
    {6, 26, 46, 66},
    {6, 26, 48, 70},
    {6, 26, 50, 74},
    {6, 30, 54, 78},
    {6, 30, 56, 82},
    {6, 30, 58, 86},
    {6, 34, 62, 90},
    {6, 28, 50, 72, 94},
    {6, 26, 50, 74, 98},
    {6, 30, 54, 78, 102},
    {6, 28, 54, 80, 106},
    {6, 32, 58, 84, 110},
    {6, 30, 58, 86, 114},
    {6, 34, 62, 90, 118},
    {6, 26, 50, 74, 98, 122},
    {6, 30, 54, 78, 102, 126},
    {6, 26, 52, 78, 104, 130},
    {6, 30, 56, 82, 108, 134},
    {6, 34, 60, 86, 112, 138},
    {6, 30, 58, 86, 114, 142},
    {6, 34, 62, 90, 118, 146},
    {6, 30, 54, 78, 102, 126, 150},
    {6, 24, 50, 76, 102, 128, 154},
    {6, 28, 54, 80, 106, 132, 158},
    {6, 32, 58, 84, 110, 136, 162},
    {6, 26, 54, 82, 110, 138, 166},
    {6, 30, 58, 86, 114, 142, 170}
};

static bool gf_initialized = false;
static uint8_t gf_ilog[512];
static uint8_t gf_log[256];

/**
 * @brief Initializes log and inverse log tables for Galois Field GF(2^8).
 * Primitive polynomial g(x) = x^8 + x^4 + x^3 + x^2 + 1 (0x11D) and primitive
 * element α = 2 are both used to populate the tables.
 * @see
 * https://people.computing.clemson.edu/~jmarty/papers/IntroToGaloisFieldsAndRSCoding.pdf
 */
static inline void init_gf_tables(void)
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
    if (0 == x || 0 == y)
        return 0;
    return gf_ilog[gf_log[x] + gf_log[y]];
}

static inline const uint8_t *compute_generator_poly(int ec_block_len)
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

static inline void shift_ec_buffer(uint8_t *ec, int ec_len)
{
    for (int idx = 0; idx < ec_len - 1; ++idx)
        ec[idx] = ec[idx + 1];
    ec[ec_len - 1] = 0;
}

static inline void apply_rs_feedback(uint8_t *ec, int ec_len, const uint8_t *g, uint8_t feedback)
{
    if (0 == feedback)
        return;
    for (int idx = 0; idx < ec_len; ++idx)
        ec[idx] ^= gf_mul(feedback, g[idx + 1]);
}

static inline void encode_rs_block(const RSBlock *block, const uint8_t *g)
{
    for (int i = 0; i < block->ec_len; ++i)
        block->ec[i] = 0;
    for (int i = 0; i < block->data_len; ++i) {
        uint8_t feedback = block->data[i] ^ block->ec[0];
        shift_ec_buffer(block->ec, block->ec_len);
        apply_rs_feedback(block->ec, block->ec_len, g, feedback);
    }
}

static inline void generate_interleaved_codewords(const uint8_t *data_codewords, const VersionCapacity *vc)
{
    int total_blocks = vc->num_blocks_g1 + vc->num_blocks_g2;
    RSBlock blocks[MAX_BLOCKS];
    uint8_t ec_blocks_data[MAX_BLOCKS][MAX_EC_CODEWORDS_PER_BLOCK];
    int ec_len = vc->c_g1 - vc->k_g1;
    int max_data_len = (vc->num_blocks_g2 > 0) ? vc->k_g2 : vc->k_g1;
    int data_offset = 0;
    int b = 0;
    for (; b < vc->num_blocks_g1; ++b) {
        blocks[b].data_len = vc->k_g1;
        blocks[b].ec_len = ec_len;
        blocks[b].data = &data_codewords[data_offset];
        blocks[b].ec = ec_blocks_data[b];
        encode_rs_block(&blocks[b], compute_generator_poly(ec_len));
        data_offset += vc->k_g1;
    }
    for (; b < total_blocks; ++b) {
        blocks[b].data_len = vc->k_g2;
        blocks[b].ec_len = ec_len;
        blocks[b].data = &data_codewords[data_offset];
        blocks[b].ec = ec_blocks_data[b];
        encode_rs_block(&blocks[b], compute_generator_poly(ec_len));
        data_offset += vc->k_g2;
    }
    int len = 0;
    int total_data_cells = max_data_len * total_blocks;
    for (int i = 0; i < total_data_cells; ++i) {
        int col = i / total_blocks;
        int b_idx = i % total_blocks;
        if (col < blocks[b_idx].data_len)
            interleaved_codewords[len++] = blocks[b_idx].data[col];
    }
    int total_ec_cells = ec_len * total_blocks;
    for (int i = 0; i < total_ec_cells; ++i) {
        int col = i / total_blocks;
        int b_idx = i % total_blocks;
        interleaved_codewords[len++] = blocks[b_idx].ec[col];
    }
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
    if (3 == group_len)
        return NUMERIC_GROUP_BITS_3;
    if (2 == group_len)
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
    if (2 == remaining_digits)
        total_bits += NUMERIC_GROUP_BITS_2;
    else if (1 == remaining_digits)
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
    int padding_bits = (BITS_PER_BYTE - (global_bit_offset % BITS_PER_BYTE)) % BITS_PER_BYTE;
    append_bits(0, padding_bits);
}

static inline void numeric_append_pad_codewords(int target_codewords)
{
    int pad_bytes_needed = target_codewords - (global_bit_offset / BITS_PER_BYTE);
    for (int i = 0; i < pad_bytes_needed; ++i)
        append_bits(NUMERIC_MODE_PAD_PATTERN[i % 2], BITS_PER_BYTE);
}

static inline const VersionCapacity *determine_version(int content_bits, ErrorCorrectionLevel target_ec_level,
                                                       int *out_cci_bits)
{
    for (int i = 0; i < VERSION_CAPACITY_LEN; ++i) {
        if (target_ec_level == VERSION_CAPACITIES[i].ec_level) {
            int version = VERSION_CAPACITIES[i].version;
            int capacity_bits = VERSION_CAPACITIES[i].data_codewords * BITS_PER_BYTE;
            int cci_bits = numeric_get_cci_bits(version);
            int data_bits = NUMERIC_MODE_BITS + cci_bits + content_bits;
            if (data_bits <= capacity_bits) {
                *out_cci_bits = cci_bits;
                return &VERSION_CAPACITIES[i];
            }
        }
    }
    return NULL;
}

static inline int get_version_modules(int version)
{
    return VERSION_MODULES_BASE + (VERSION_MODULES_STEP * version);
}

static inline int get_format_info(ErrorCorrectionLevel ec_level, int mask_pattern)
{
    int format_data = (EC_FORMAT_BITS[ec_level] << 3) | mask_pattern;
    int bch_checksum = format_data << 10;
    for (int bit_idx = 14; bit_idx >= 10; --bit_idx)
        if ((bch_checksum >> bit_idx) & 1)
            bch_checksum ^= (FORMAT_INFO_POLY << (bit_idx - 10));
    return ((format_data << 10) | bch_checksum) ^ FORMAT_INFO_MASK_PATTERN;
}

static inline int get_version_info(int version)
{
    int bch_checksum = version << 12;
    for (int bit_idx = 17; bit_idx >= 12; --bit_idx)
        if ((bch_checksum >> bit_idx) & 1)
            bch_checksum ^= (VERSION_INFO_POLY << (bit_idx - 12));
    return (version << 12) | bch_checksum;
}

static inline bool is_overlapping_finder_pattern(int row, int col, int version_modules)
{
    if (row < FINDER_PATTERN_AREA_SIZE && col < FINDER_PATTERN_AREA_SIZE)
        return true;
    if (row < FINDER_PATTERN_AREA_SIZE && col >= version_modules - FINDER_PATTERN_AREA_SIZE)
        return true;
    if (row >= version_modules - FINDER_PATTERN_AREA_SIZE && col < FINDER_PATTERN_AREA_SIZE)
        return true;
    return false;
}

static inline bool is_in_timing_range(int val, int version_modules)
{
    if (val < FINDER_PATTERN_AREA_SIZE)
        return false;
    if (val > version_modules - TIMING_PATTERN_END_MARGIN)
        return false;
    return true;
}

static inline bool is_inside_alignment_box(int row, int col, int center_row, int center_col)
{
    if (row < center_row - ALIGNMENT_PATTERN_CENTER_OFFSET)
        return false;
    if (row > center_row + ALIGNMENT_PATTERN_CENTER_OFFSET)
        return false;
    if (col < center_col - ALIGNMENT_PATTERN_CENTER_OFFSET)
        return false;
    if (col > center_col + ALIGNMENT_PATTERN_CENTER_OFFSET)
        return false;
    return true;
}

static inline int get_alignment_coords_count(const int *coords)
{
    int count = 0;
    while (count < MAX_ALIGNMENT_COORDS && 0 != coords[count])
        ++count;
    return count;
}

static inline bool is_overlapping_format_info(int row, int col, int version_modules)
{
    if (FORMAT_INFO_COORD == row)
        return col <= FORMAT_INFO_COORD || col >= version_modules - FINDER_PATTERN_AREA_SIZE;
    if (FORMAT_INFO_COORD == col)
        return row <= FORMAT_INFO_COORD || row >= version_modules - FINDER_PATTERN_AREA_SIZE;
    return false;
}

static inline bool is_overlapping_timing_pattern(int row, int col, int version_modules)
{
    if (TIMING_PATTERN_COORD == row)
        return is_in_timing_range(col, version_modules);
    if (TIMING_PATTERN_COORD == col)
        return is_in_timing_range(row, version_modules);
    return false;
}

static inline bool is_overlapping_version_info(int row, int col, int version, int version_modules)
{
    if (version < VERSION_INFO_MIN_VERSION)
        return false;
    if (row <= VERSION_INFO_MAX_COORD && col >= version_modules - VERSION_INFO_EDGE_OFFSET)
        return true;
    if (row >= version_modules - VERSION_INFO_EDGE_OFFSET && col <= VERSION_INFO_MAX_COORD)
        return true;
    return false;
}

static inline bool is_overlapping_alignment_pattern(int row, int col, int version, int version_modules)
{
    if (NO_ALIGNMENT_VERSION == version)
        return false;
    const int *coords = ALIGNMENT_PATTERN_COORDS[version];
    int num_coords = get_alignment_coords_count(coords);
    for (int i = 0; i < num_coords; ++i) {
        for (int j = 0; j < num_coords; ++j) {
            int center_row = coords[i];
            int center_col = coords[j];
            if (is_overlapping_finder_pattern(center_row, center_col, version_modules))
                continue;
            if (is_inside_alignment_box(row, col, center_row, center_col))
                return true;
        }
    }
    return false;
}

static inline bool is_reserved_position(int row, int col, int version, int version_modules)
{
    if (is_overlapping_finder_pattern(row, col, version_modules))
        return true;
    if (is_overlapping_format_info(row, col, version_modules))
        return true;
    if (is_overlapping_timing_pattern(row, col, version_modules))
        return true;
    if (is_overlapping_version_info(row, col, version, version_modules))
        return true;
    if (is_overlapping_alignment_pattern(row, col, version, version_modules))
        return true;
    return false;
}

static inline bool mask_rule_0(int i, int j)
{
    return 0 == ((i + j) % 2);
}

static inline bool mask_rule_1(int i, int _)
{
    return 0 == (i % 2);
}

static inline bool mask_rule_2(int _, int j)
{
    return 0 == (j % 3);
}

static inline bool mask_rule_3(int i, int j)
{
    return 0 == ((i + j) % 3);
}

static inline bool mask_rule_4(int i, int j)
{
    return 0 == (((i / 2) + (j / 3)) % 2);
}

static inline bool mask_rule_5(int i, int j)
{
    return 0 == (((i * j) % 2) + ((i * j) % 3));
}

static inline bool mask_rule_6(int i, int j)
{
    return 0 == ((((i * j) % 2) + ((i * j) % 3)) % 2);
}

static inline bool mask_rule_7(int i, int j)
{
    return 0 == ((((i + j) % 2) + ((i * j) % 3)) % 2);
}

static const MaskEvaluator MASK_EVALUATORS[8] = {mask_rule_0, mask_rule_1, mask_rule_2, mask_rule_3,
                                                 mask_rule_4, mask_rule_5, mask_rule_6, mask_rule_7};

static inline bool evaluate_mask_condition(int mask_pattern, int i, int j)
{
    if (mask_pattern < 0 || mask_pattern > 7)
        return false;
    return MASK_EVALUATORS[mask_pattern](i, j);
}

static inline QRZigZag zigzag_create(int grid_dim, int version)
{
    return (QRZigZag){.grid_dim = grid_dim,
                      .version = version,
                      .col = grid_dim - 1,
                      .dir = DIRECTION_UP,
                      .step_row = 0,
                      .step_col = 0};
}

static inline bool next_zigzag_coord(QRZigZag *zz, int *out_y, int *out_x)
{
    while (zz->col > 0) {
        if (TIMING_PATTERN_COORD == zz->col)
            --zz->col;
        int module_y = (DIRECTION_UP == zz->dir) ? (zz->grid_dim - 1 - zz->step_row) : zz->step_row;
        int module_x = zz->col - zz->step_col;
        bool is_valid = !is_reserved_position(module_y, module_x, zz->version, zz->grid_dim);
        ++zz->step_col;
        zz->step_row += (zz->step_col / 2);
        zz->step_col %= 2;
        if (zz->step_row == zz->grid_dim) {
            zz->step_row = 0;
            zz->dir = -zz->dir;
            zz->col -= 2;
        }
        if (is_valid) {
            *out_y = module_y;
            *out_x = module_x;
            return true;
        }
    }
    return false;
}

static inline void plot_eval_finder_pattern(int row_offset, int col_offset, int grid_size)
{
    int start_row = MATH_MAX(0, row_offset - 1);
    int end_row = MATH_MIN(grid_size - 1, row_offset + 7);
    int start_col = MATH_MAX(0, col_offset - 1);
    int end_col = MATH_MIN(grid_size - 1, col_offset + 7);
    for (int absolute_row = start_row; absolute_row <= end_row; ++absolute_row) {
        for (int absolute_col = start_col; absolute_col <= end_col; ++absolute_col) {
            int local_row = absolute_row - row_offset;
            int local_col = absolute_col - col_offset;
            int center_row = 3;
            int center_col = 3;
            int row_distance = MATH_ABS(local_row - center_row);
            int col_distance = MATH_ABS(local_col - center_col);
            int ring_distance = MATH_MAX(row_distance, col_distance);
            bool is_light_ring = (4 == ring_distance || 2 == ring_distance);
            eval_base_grid[absolute_row][absolute_col] = is_light_ring ? 0 : 1;
        }
    }
}

static inline void plot_eval_timing_patterns(int size)
{
    for (int i = 8; i < size - 8; ++i) {
        eval_base_grid[6][i] = (0 == i % 2) ? 1 : 0;
        eval_base_grid[i][6] = (0 == i % 2) ? 1 : 0;
    }
}

static inline void plot_single_alignment_pattern(int center_row, int center_col)
{
    for (int row = center_row - 2; row <= center_row + 2; ++row) {
        for (int col = center_col - 2; col <= center_col + 2; ++col) {
            int row_distance = MATH_ABS(row - center_row);
            int col_distance = MATH_ABS(col - center_col);
            int ring_distance = MATH_MAX(row_distance, col_distance);
            eval_base_grid[row][col] = (1 != ring_distance) ? 1 : 0;
        }
    }
}

static inline void plot_eval_alignment_patterns(int version, int grid_size)
{
    if (NO_ALIGNMENT_VERSION == version)
        return;
    const int *alignment_coords = ALIGNMENT_PATTERN_COORDS[version];
    int coord_count = get_alignment_coords_count(alignment_coords);
    for (int row_idx = 0; row_idx < coord_count; ++row_idx) {
        for (int col_idx = 0; col_idx < coord_count; ++col_idx) {
            int center_row = alignment_coords[row_idx];
            int center_col = alignment_coords[col_idx];
            if (!is_overlapping_finder_pattern(center_row, center_col, grid_size))
                plot_single_alignment_pattern(center_row, center_col);
        }
    }
}

static inline void plot_eval_version_info(int version, int size)
{
    if (version < VERSION_INFO_MIN_VERSION)
        return;
    int version_bits = get_version_info(version);
    for (int i = 0; i < VERSION_INFO_BITS; ++i) {
        uint8_t bit = (uint8_t)((version_bits >> i) & 1);
        int vi_row = i / 3;
        int vi_col = i % 3;
        eval_base_grid[vi_row][size - VERSION_INFO_EDGE_OFFSET + vi_col] = bit;
        eval_base_grid[size - VERSION_INFO_EDGE_OFFSET + vi_col][vi_row] = bit;
    }
}

static inline void build_base_grid(const QRContext *ctx)
{
    for (int r = 0; r < ctx->grid_dim; ++r)
        for (int c = 0; c < ctx->grid_dim; ++c)
            eval_base_grid[r][c] = 0;
    plot_eval_finder_pattern(0, 0, ctx->grid_dim);
    plot_eval_finder_pattern(0, ctx->grid_dim - 7, ctx->grid_dim);
    plot_eval_finder_pattern(ctx->grid_dim - 7, 0, ctx->grid_dim);
    plot_eval_timing_patterns(ctx->grid_dim);
    plot_eval_alignment_patterns(ctx->version, ctx->grid_dim);
    plot_eval_version_info(ctx->version, ctx->grid_dim);
}

static inline int calculate_consecutive_penalty(int consecutive_count)
{
    return (consecutive_count >= 5) ? (PENALTY_N1 + (consecutive_count - 5)) : 0;
}

static inline int score_penalty_rule_1(int grid_dim)
{
    int penalty = 0;
    for (int i = 0; i < grid_dim; ++i) {
        int consecutive_row_modules = 1;
        int consecutive_col_modules = 1;
        for (int j = 1; j < grid_dim; ++j) {
            if (eval_grid[i][j] != eval_grid[i][j - 1]) {
                penalty += calculate_consecutive_penalty(consecutive_row_modules);
                consecutive_row_modules = 0;
            }
            ++consecutive_row_modules;
            if (eval_grid[j][i] != eval_grid[j - 1][i]) {
                penalty += calculate_consecutive_penalty(consecutive_col_modules);
                consecutive_col_modules = 0;
            }
            ++consecutive_col_modules;
        }
        penalty += calculate_consecutive_penalty(consecutive_row_modules);
        penalty += calculate_consecutive_penalty(consecutive_col_modules);
    }
    return penalty;
}

static inline bool is_solid_2x2_block(int row, int col)
{
    int block_sum =
        eval_grid[row][col] + eval_grid[row][col + 1] + eval_grid[row + 1][col] + eval_grid[row + 1][col + 1];
    return (0 == block_sum || 4 == block_sum);
}

static inline int score_penalty_rule_2(int grid_size)
{
    int penalty = 0;
    for (int row = 0; row < grid_size - 1; ++row)
        for (int col = 0; col < grid_size - 1; ++col)
            if (is_solid_2x2_block(row, col))
                penalty += PENALTY_N2;
    return penalty;
}

static inline int get_module_color(int row, int col, int grid_size)
{
    if (row < 0)
        return 0;
    if (row >= grid_size)
        return 0;
    if (col < 0)
        return 0;
    if (col >= grid_size)
        return 0;
    return eval_grid[row][col];
}

static inline bool is_horizontal_penalty_3(int row, int col, int grid_size)
{
    for (int k = 0; k < 7; ++k)
        if (eval_grid[row][col + k] != PENALTY_RULE_3_PATTERN[k])
            return false;
    int before_sum = 0;
    for (int k = 1; k <= 4; ++k)
        before_sum += get_module_color(row, col - k, grid_size);
    int after_sum = 0;
    for (int k = 1; k <= 4; ++k)
        after_sum += get_module_color(row, col + 6 + k, grid_size);
    return (0 == before_sum) || (0 == after_sum);
}

static inline bool is_vertical_penalty_3(int row, int col, int grid_size)
{
    for (int k = 0; k < 7; ++k)
        if (eval_grid[row + k][col] != PENALTY_RULE_3_PATTERN[k])
            return false;
    int before_sum = 0;
    for (int k = 1; k <= 4; ++k)
        before_sum += get_module_color(row - k, col, grid_size);
    int after_sum = 0;
    for (int k = 1; k <= 4; ++k)
        after_sum += get_module_color(row + 6 + k, col, grid_size);
    return (0 == before_sum) || (0 == after_sum);
}

static inline int score_penalty_rule_3(int grid_size)
{
    int penalty = 0;
    for (int i = 0; i < grid_size; ++i) {
        for (int j = 0; j < grid_size - 6; ++j) {
            if (is_horizontal_penalty_3(i, j, grid_size))
                penalty += PENALTY_N3;
            if (is_vertical_penalty_3(j, i, grid_size))
                penalty += PENALTY_N3;
        }
    }
    return penalty;
}

static inline int score_penalty_rule_4(int grid_size)
{
    int total_dark_modules = 0;
    int total_modules = grid_size * grid_size;
    for (int row = 0; row < grid_size; ++row)
        for (int col = 0; col < grid_size; ++col)
            if (1 == eval_grid[row][col])
                ++total_dark_modules;
    int dark_percentage = (total_dark_modules * 100) / total_modules;
    int lower_bound_percent = (dark_percentage / 5) * 5;
    int upper_bound_percent = lower_bound_percent + 5;
    int abs_diff_lower = MATH_ABS(lower_bound_percent - 50);
    int abs_diff_upper = MATH_ABS(upper_bound_percent - 50);
    int min_deviation = MATH_MIN(abs_diff_lower, abs_diff_upper);
    return (min_deviation / 5) * PENALTY_N4;
}

static inline void plot_eval_format_info(const QRContext *ctx)
{
    int format_bits = get_format_info(ctx->ec_level, ctx->mask_pattern);
    eval_grid[8][ctx->grid_dim - 8] = 1;
    for (int i = 0; i < FORMAT_INFO_BITS; ++i) {
        uint8_t bit = (uint8_t)((format_bits >> i) & 1);
        int row_1 = FORMAT_INFO_ROW[i];
        int col_1 = FORMAT_INFO_COL[i];
        eval_grid[row_1][col_1] = bit;
        int row_2 = (i < 8) ? (ctx->grid_dim - 1 - i) : 8;
        int col_2 = (i < 8) ? 8 : (ctx->grid_dim - FORMAT_INFO_BITS + i);
        eval_grid[row_2][col_2] = bit;
    }
}

static inline void plot_eval_data_codewords(const QRContext *ctx)
{
    int total_codewords = (ctx->vc->num_blocks_g1 * ctx->vc->c_g1) + (ctx->vc->num_blocks_g2 * ctx->vc->c_g2);
    int total_bits = total_codewords * BITS_PER_BYTE;
    int placed_bits = 0;
    int row, col;
    QRZigZag zz = zigzag_create(ctx->grid_dim, ctx->version);
    while (next_zigzag_coord(&zz, &row, &col)) {
        bool is_dark_module = false;
        if (placed_bits < total_bits) {
            int byte_idx = placed_bits / BITS_PER_BYTE;
            int bit_idx = 7 - (placed_bits % BITS_PER_BYTE);
            is_dark_module = (interleaved_codewords[byte_idx] >> bit_idx) & 1;
        }
        if (evaluate_mask_condition(ctx->mask_pattern, row, col))
            is_dark_module = !is_dark_module;
        eval_grid[row][col] = is_dark_module ? 1 : 0;
        ++placed_bits;
    }
}

static inline void populate_eval_grid(const QRContext *ctx)
{
    for (int row = 0; row < ctx->grid_dim; ++row)
        for (int col = 0; col < ctx->grid_dim; ++col)
            eval_grid[row][col] = eval_base_grid[row][col];
    plot_eval_format_info(ctx);
    plot_eval_data_codewords(ctx);
}

static inline int score_mask(QRContext *ctx)
{
    populate_eval_grid(ctx);
    return score_penalty_rule_1(ctx->grid_dim) + score_penalty_rule_2(ctx->grid_dim) +
           score_penalty_rule_3(ctx->grid_dim) + score_penalty_rule_4(ctx->grid_dim);
}

static inline int find_best_mask(QRContext *ctx)
{
    int best_mask = 0;
    int lowest_penalty = INT32_MAX;
    for (int mask = 0; mask < 8; ++mask) {
        ctx->mask_pattern = mask;
        int penalty = score_mask(ctx);
        if (penalty < lowest_penalty) {
            lowest_penalty = penalty;
            best_mask = mask;
        }
    }
    return best_mask;
}

static inline void apply_mask_to_codewords(const QRContext *ctx, int best_mask)
{
    int total_codewords = (ctx->vc->num_blocks_g1 * ctx->vc->c_g1) + (ctx->vc->num_blocks_g2 * ctx->vc->c_g2);
    int total_bits = total_codewords * BITS_PER_BYTE;
    int placed_bits = 0;
    int row, col;
    QRZigZag zz = zigzag_create(ctx->grid_dim, ctx->version);
    while (placed_bits < total_bits && next_zigzag_coord(&zz, &row, &col)) {
        if (evaluate_mask_condition(best_mask, row, col)) {
            int byte_idx = placed_bits / BITS_PER_BYTE;
            int bit_idx = 7 - (placed_bits % BITS_PER_BYTE);
            interleaved_codewords[byte_idx] ^= (1 << bit_idx);
        }
        ++placed_bits;
    }
}

static inline int apply_best_data_mask(QRContext *ctx)
{
    build_base_grid(ctx);
    int best_mask = find_best_mask(ctx);
    apply_mask_to_codewords(ctx, best_mask);
    return best_mask;
}

static inline void emplace_finder_pattern(Canvas *c, int x, int y)
{
    canvas_stroke_rect(c, x, y, FINDER_PATTERN_SIZE * module_size, FINDER_PATTERN_SIZE * module_size, module_size,
                       C_BLACK);
    canvas_fill_rect(c, x + (FINDER_PATTERN_INNER_OFFSET * module_size),
                     y + (FINDER_PATTERN_INNER_OFFSET * module_size), FINDER_PATTERN_INNER_SIZE * module_size,
                     FINDER_PATTERN_INNER_SIZE * module_size, C_BLACK);
}

static inline void emplace_finder_patterns(const QRContext *ctx)
{
    int top_left_x = ctx->quiet_zone_width;
    int top_left_y = ctx->quiet_zone_width;
    emplace_finder_pattern(ctx->canvas, top_left_x, top_left_y);
    int top_right_x = ctx->quiet_zone_width + ((ctx->grid_dim - FINDER_PATTERN_SIZE) * module_size);
    int top_right_y = ctx->quiet_zone_width;
    emplace_finder_pattern(ctx->canvas, top_right_x, top_right_y);
    int bottom_left_x = ctx->quiet_zone_width;
    int bottom_left_y = ctx->quiet_zone_width + ((ctx->grid_dim - FINDER_PATTERN_SIZE) * module_size);
    emplace_finder_pattern(ctx->canvas, bottom_left_x, bottom_left_y);
}

static inline void emplace_timing_patterns(const QRContext *ctx)
{
    for (int i = FINDER_PATTERN_AREA_SIZE; i <= ctx->grid_dim - TIMING_PATTERN_END_MARGIN; ++i) {
        uint32_t color = (0 == i % 2) ? C_BLACK : C_WHITE;
        canvas_fill_rect(ctx->canvas, ctx->quiet_zone_width + (i * module_size),
                         ctx->quiet_zone_width + (TIMING_PATTERN_COORD * module_size), module_size, module_size, color);
        canvas_fill_rect(ctx->canvas, ctx->quiet_zone_width + (TIMING_PATTERN_COORD * module_size),
                         ctx->quiet_zone_width + (i * module_size), module_size, module_size, color);
    }
}

static inline void emplace_alignment_pattern(Canvas *c, int cx, int cy, int quiet_zone_width)
{
    int box_x = quiet_zone_width + ((cx - ALIGNMENT_PATTERN_CENTER_OFFSET) * module_size);
    int box_y = quiet_zone_width + ((cy - ALIGNMENT_PATTERN_CENTER_OFFSET) * module_size);
    canvas_stroke_rect(c, box_x, box_y, ALIGNMENT_PATTERN_SIZE * module_size, ALIGNMENT_PATTERN_SIZE * module_size,
                       module_size, C_BLACK);
    canvas_fill_rect(c, box_x + (ALIGNMENT_PATTERN_CENTER_OFFSET * module_size),
                     box_y + (ALIGNMENT_PATTERN_CENTER_OFFSET * module_size), module_size, module_size, C_BLACK);
}

static inline void emplace_alignment_patterns(const QRContext *ctx)
{
    if (NO_ALIGNMENT_VERSION == ctx->version)
        return;
    const int *coords = ALIGNMENT_PATTERN_COORDS[ctx->version];
    int num_coords = get_alignment_coords_count(coords);
    for (int i = 0; i < num_coords; ++i) {
        for (int j = 0; j < num_coords; ++j) {
            int row = coords[i];
            int col = coords[j];
            if (is_overlapping_finder_pattern(row, col, ctx->grid_dim))
                continue;
            emplace_alignment_pattern(ctx->canvas, col, row, ctx->quiet_zone_width);
        }
    }
}

static inline void emplace_format_info(const QRContext *ctx)
{
    int format_bits = get_format_info(ctx->ec_level, ctx->mask_pattern);
    int dark_x = ctx->quiet_zone_width + (8 * module_size);
    int dark_y = ctx->quiet_zone_width + ((ctx->grid_dim - 8) * module_size);
    canvas_fill_rect(ctx->canvas, dark_x, dark_y, module_size, module_size, C_BLACK);
    for (int i = 0; i < FORMAT_INFO_BITS; ++i) {
        uint8_t bit = (uint8_t)((format_bits >> i) & 1);
        uint32_t color = bit ? C_BLACK : C_WHITE;
        int x1 = FORMAT_INFO_COL[i];
        int y1 = FORMAT_INFO_ROW[i];
        int x2, y2;
        if (i < 8) {
            x2 = ctx->grid_dim - 1 - i;
            y2 = 8;
        } else {
            x2 = 8;
            y2 = ctx->grid_dim - FORMAT_INFO_BITS + i;
        }
        int top_left_x = ctx->quiet_zone_width + (x1 * module_size);
        int top_left_y = ctx->quiet_zone_width + (y1 * module_size);
        canvas_fill_rect(ctx->canvas, top_left_x, top_left_y, module_size, module_size, color);
        int split_x = ctx->quiet_zone_width + (x2 * module_size);
        int split_y = ctx->quiet_zone_width + (y2 * module_size);
        canvas_fill_rect(ctx->canvas, split_x, split_y, module_size, module_size, color);
    }
}

static inline void emplace_version_info(const QRContext *ctx)
{
    if (ctx->version < VERSION_INFO_MIN_VERSION)
        return;
    int version_bits = get_version_info(ctx->version);
    for (int i = 0; i < VERSION_INFO_BITS; ++i) {
        uint8_t bit = (uint8_t)((version_bits >> i) & 1);
        uint32_t color = bit ? C_BLACK : C_WHITE;
        int vi_row = i / 3;
        int vi_col = i % 3;
        int top_right_x = ctx->grid_dim - VERSION_INFO_EDGE_OFFSET + vi_col;
        int top_right_y = vi_row;
        canvas_fill_rect(ctx->canvas, ctx->quiet_zone_width + (top_right_x * module_size),
                         ctx->quiet_zone_width + (top_right_y * module_size), module_size, module_size, color);
        int bottom_left_x = vi_row;
        int bottom_left_y = ctx->grid_dim - VERSION_INFO_EDGE_OFFSET + vi_col;
        canvas_fill_rect(ctx->canvas, ctx->quiet_zone_width + (bottom_left_x * module_size),
                         ctx->quiet_zone_width + (bottom_left_y * module_size), module_size, module_size, color);
    }
}

static inline void emplace_codewords(const QRContext *ctx)
{
    int total_codewords = (ctx->vc->num_blocks_g1 * ctx->vc->c_g1) + (ctx->vc->num_blocks_g2 * ctx->vc->c_g2);
    int total_bits = total_codewords * BITS_PER_BYTE;
    int placed_bits = 0;
    int row, col;
    QRZigZag zz = zigzag_create(ctx->grid_dim, ctx->version);
    while (next_zigzag_coord(&zz, &row, &col)) {
        bool is_dark_module;
        bool is_padding_remainder = placed_bits >= total_bits;
        if (is_padding_remainder) {
            is_dark_module = evaluate_mask_condition(ctx->mask_pattern, row, col);
        } else {
            int byte_index = placed_bits / BITS_PER_BYTE;
            int bit_within_byte = 7 - (placed_bits % BITS_PER_BYTE);
            is_dark_module = (interleaved_codewords[byte_index] >> bit_within_byte) & 1;
        }
        uint32_t module_color = is_dark_module ? C_BLACK : C_WHITE;
        canvas_fill_rect(ctx->canvas, ctx->quiet_zone_width + (col * module_size),
                         ctx->quiet_zone_width + (row * module_size), module_size, module_size, module_color);
        ++placed_bits;
    }
}

static inline void process_qr_data(void)
{
    init_gf_tables();
    int len = wasm_strlen(data);
    int content_bits = numeric_get_content_bits(len);
    int target_cci_length = -1;
    const VersionCapacity *vc = determine_version(content_bits, error_correction_level, &target_cci_length);
    if (!vc)
        return;
    int target_version = vc->version;
    int target_codewords = vc->data_codewords;
    global_bit_offset = 0;
    wasm_memset(codeword_buffer, 0, sizeof(codeword_buffer));
    append_bits(NUMERIC_MODE_INDICATOR, NUMERIC_MODE_BITS);
    append_bits(len, target_cci_length);
    numeric_encode_segment_data(data, len);
    numeric_append_terminator(target_codewords);
    numeric_append_padding_bits();
    numeric_append_pad_codewords(target_codewords);
    generate_interleaved_codewords(codeword_buffer, vc);
    int quiet_zone_width = module_size * QUIET_ZONE_MULTIPLIER;
    int version_modules = get_version_modules(target_version);
    int qr_dim = (quiet_zone_width * 2) + (version_modules * module_size);
    canvas_width = qr_dim;
    canvas_height = qr_dim;
    Canvas c = canvas_create(pixels, canvas_width, canvas_height);
    canvas_fill_rect(&c, 0, 0, canvas_width, canvas_height, C_WHITE);
    QRContext ctx = {.canvas = &c,
                     .version = target_version,
                     .grid_dim = version_modules,
                     .quiet_zone_width = quiet_zone_width,
                     .ec_level = error_correction_level,
                     .vc = vc,
                     .mask_pattern = 0};
    ctx.mask_pattern = apply_best_data_mask(&ctx);
    emplace_finder_patterns(&ctx);
    emplace_timing_patterns(&ctx);
    emplace_alignment_patterns(&ctx);
    emplace_format_info(&ctx);
    emplace_version_info(&ctx);
    emplace_codewords(&ctx);
}

void render(void)
{
    data = get_data_buffer();
    error_correction_level = EC_L;
    module_size = MODULE_BASE_SIZE * dpr;
    process_qr_data();
}
