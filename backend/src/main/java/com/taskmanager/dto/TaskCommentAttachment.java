// File responsibility: Carries persisted task comment attachment bytes and metadata for downloads.
package com.taskmanager.dto;

public record TaskCommentAttachment(
        String fileName,
        String contentType,
        long size,
        byte[] data
) {
}
