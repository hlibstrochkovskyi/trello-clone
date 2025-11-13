package com.example.trello_clone.dto;

public class MoveTaskRequest {
    private Long targetColumnId;
    private Integer newPosition;

    // Manual Getters and Setters
    public Long getTargetColumnId() {
        return targetColumnId;
    }

    public void setTargetColumnId(Long targetColumnId) {
        this.targetColumnId = targetColumnId;
    }

    public Integer getNewPosition() {
        return newPosition;
    }

    public void setNewPosition(Integer newPosition) {
        this.newPosition = newPosition;
    }
}