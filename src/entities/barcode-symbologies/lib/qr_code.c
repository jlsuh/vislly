#include "barcode.h"

#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

#define BITS_PER_BYTE 8
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
} VersionCapacity;

static uint8_t codeword_buffer[MAX_QR_CODEWORDS];
static int global_bit_offset = 0;

static const char *data;
static ErrorCorrectionLevel error_correction_level;

static const int NUMERIC_MODE_PAD_PATTERN[] = {0xEC, 0x11};

static const VersionCapacity VERSION_CAPACITIES[VERSION_CAPACITY_LEN] = {
    {1, EC_L, 19},    {1, EC_M, 16},    {1, EC_Q, 13},    {1, EC_H, 9},
    {2, EC_L, 34},    {2, EC_M, 28},    {2, EC_Q, 22},    {2, EC_H, 16},
    {3, EC_L, 55},    {3, EC_M, 44},    {3, EC_Q, 34},    {3, EC_H, 26},
    {4, EC_L, 80},    {4, EC_M, 64},    {4, EC_Q, 48},    {4, EC_H, 36},
    {5, EC_L, 108},   {5, EC_M, 86},    {5, EC_Q, 62},    {5, EC_H, 46},
    {6, EC_L, 136},   {6, EC_M, 108},   {6, EC_Q, 76},    {6, EC_H, 60},
    {7, EC_L, 156},   {7, EC_M, 124},   {7, EC_Q, 88},    {7, EC_H, 66},
    {8, EC_L, 194},   {8, EC_M, 154},   {8, EC_Q, 110},   {8, EC_H, 86},
    {9, EC_L, 232},   {9, EC_M, 182},   {9, EC_Q, 132},   {9, EC_H, 100},
    {10, EC_L, 274},  {10, EC_M, 216},  {10, EC_Q, 154},  {10, EC_H, 122},
    {11, EC_L, 324},  {11, EC_M, 254},  {11, EC_Q, 180},  {11, EC_H, 140},
    {12, EC_L, 370},  {12, EC_M, 290},  {12, EC_Q, 206},  {12, EC_H, 158},
    {13, EC_L, 428},  {13, EC_M, 334},  {13, EC_Q, 244},  {13, EC_H, 180},
    {14, EC_L, 461},  {14, EC_M, 365},  {14, EC_Q, 261},  {14, EC_H, 197},
    {15, EC_L, 523},  {15, EC_M, 415},  {15, EC_Q, 295},  {15, EC_H, 223},
    {16, EC_L, 589},  {16, EC_M, 453},  {16, EC_Q, 325},  {16, EC_H, 253},
    {17, EC_L, 647},  {17, EC_M, 507},  {17, EC_Q, 367},  {17, EC_H, 283},
    {18, EC_L, 721},  {18, EC_M, 563},  {18, EC_Q, 397},  {18, EC_H, 313},
    {19, EC_L, 795},  {19, EC_M, 627},  {19, EC_Q, 445},  {19, EC_H, 341},
    {20, EC_L, 861},  {20, EC_M, 669},  {20, EC_Q, 485},  {20, EC_H, 385},
    {21, EC_L, 932},  {21, EC_M, 714},  {21, EC_Q, 512},  {21, EC_H, 406},
    {22, EC_L, 1006}, {22, EC_M, 782},  {22, EC_Q, 568},  {22, EC_H, 442},
    {23, EC_L, 1094}, {23, EC_M, 860},  {23, EC_Q, 614},  {23, EC_H, 464},
    {24, EC_L, 1174}, {24, EC_M, 914},  {24, EC_Q, 664},  {24, EC_H, 514},
    {25, EC_L, 1276}, {25, EC_M, 1000}, {25, EC_Q, 718},  {25, EC_H, 538},
    {26, EC_L, 1370}, {26, EC_M, 1062}, {26, EC_Q, 754},  {26, EC_H, 596},
    {27, EC_L, 1468}, {27, EC_M, 1128}, {27, EC_Q, 808},  {27, EC_H, 628},
    {28, EC_L, 1531}, {28, EC_M, 1193}, {28, EC_Q, 871},  {28, EC_H, 661},
    {29, EC_L, 1631}, {29, EC_M, 1267}, {29, EC_Q, 911},  {29, EC_H, 701},
    {30, EC_L, 1735}, {30, EC_M, 1373}, {30, EC_Q, 985},  {30, EC_H, 745},
    {31, EC_L, 1843}, {31, EC_M, 1455}, {31, EC_Q, 1033}, {31, EC_H, 793},
    {32, EC_L, 1955}, {32, EC_M, 1541}, {32, EC_Q, 1115}, {32, EC_H, 845},
    {33, EC_L, 2071}, {33, EC_M, 1631}, {33, EC_Q, 1171}, {33, EC_H, 901},
    {34, EC_L, 2191}, {34, EC_M, 1725}, {34, EC_Q, 1231}, {34, EC_H, 961},
    {35, EC_L, 2306}, {35, EC_M, 1812}, {35, EC_Q, 1286}, {35, EC_H, 986},
    {36, EC_L, 2434}, {36, EC_M, 1914}, {36, EC_Q, 1354}, {36, EC_H, 1054},
    {37, EC_L, 2566}, {37, EC_M, 1992}, {37, EC_Q, 1426}, {37, EC_H, 1096},
    {38, EC_L, 2702}, {38, EC_M, 2102}, {38, EC_Q, 1502}, {38, EC_H, 1142},
    {39, EC_L, 2812}, {39, EC_M, 2216}, {39, EC_Q, 1582}, {39, EC_H, 1222},
    {40, EC_L, 2956}, {40, EC_M, 2334}, {40, EC_Q, 1666}, {40, EC_H, 1276}};

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

static inline int get_numeric_group_length(int remaining_digits)
{
    if (remaining_digits >= NUMERIC_GROUP_SIZE)
        return NUMERIC_GROUP_SIZE;
    return remaining_digits;
}

static inline int get_bit_count_for_numeric_group(int group_len)
{
    if (group_len == 3)
        return NUMERIC_GROUP_BITS_3;
    if (group_len == 2)
        return NUMERIC_GROUP_BITS_2;
    return NUMERIC_GROUP_BITS_1;
}

static inline int get_terminator_length(int remaining_bits)
{
    if (remaining_bits > NUMERIC_MAX_TERMINATOR_LENGTH)
        return NUMERIC_MAX_TERMINATOR_LENGTH;
    return remaining_bits;
}

static inline int get_numeric_cci_length(int version)
{
    if (version < 10)
        return NUMERIC_CCI_BITS_1_9;
    if (version < 27)
        return NUMERIC_CCI_BITS_10_26;
    return NUMERIC_CCI_BITS_27_40;
}

static inline int get_numeric_data_bits_length(int len)
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
        int group_len = get_numeric_group_length(remaining_digits);
        int value = 0;
        for (int j = 0; j < group_len; ++j)
            value = (value * 10) + char_to_digit(data[i + j]);
        int bit_count = get_bit_count_for_numeric_group(group_len);
        append_bits(value, bit_count);
    }
}

static inline void numeric_append_terminator(int target_codewords)
{
    int max_capacity_bits = target_codewords * BITS_PER_BYTE;
    int remaining_bits = max_capacity_bits - global_bit_offset;
    int terminator_len = get_terminator_length(remaining_bits);
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

static bool determine_version(int data_bits, ErrorCorrectionLevel ec_level,
                              int *out_version, int *out_codewords,
                              int *out_cci_length)
{
    for (int i = 0; i < VERSION_CAPACITY_LEN; ++i) {
        if (VERSION_CAPACITIES[i].ec_level == ec_level) {
            int version = VERSION_CAPACITIES[i].version;
            int capacity_bits =
                VERSION_CAPACITIES[i].data_codewords * BITS_PER_BYTE;
            int cci_length = get_numeric_cci_length(version);
            int total_needed_bits = NUMERIC_MODE_BITS + cci_length + data_bits;
            if (total_needed_bits <= capacity_bits) {
                *out_version = version;
                *out_codewords = VERSION_CAPACITIES[i].data_codewords;
                *out_cci_length = cci_length;
                return true;
            }
        }
    }
    return false;
}

void process_qr_data(void)
{
    int len = wasm_strlen(data);
    int data_bits = get_numeric_data_bits_length(len);
    int target_version = -1;
    int target_codewords = -1;
    int target_cci_length = -1;
    if (!determine_version(data_bits, error_correction_level, &target_version,
                           &target_codewords, &target_cci_length)) {
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
}

void render(void)
{
}
