package com.mandiri.branchperformance.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.nio.ByteBuffer;
import java.util.UUID;

/**
 * Maps Oracle RAW(16) ↔ java.util.UUID.
 *
 * Oracle JDBC returns RAW columns as byte[]. UUID uses two 64-bit longs
 * (mostSignificantBits, leastSignificantBits) stored big-endian in 16 bytes.
 *
 * autoApply = true → applied automatically to every UUID field in all entities,
 * no @Convert annotation needed on individual columns.
 */
@Converter(autoApply = true)
public class UuidRaw16Converter implements AttributeConverter<UUID, byte[]> {

    @Override
    public byte[] convertToDatabaseColumn(UUID uuid) {
        if (uuid == null) return null;
        ByteBuffer bb = ByteBuffer.allocate(16);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }

    @Override
    public UUID convertToEntityAttribute(byte[] bytes) {
        if (bytes == null || bytes.length != 16) return null;
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long msb = bb.getLong();
        long lsb = bb.getLong();
        return new UUID(msb, lsb);
    }
}
