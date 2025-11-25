package com.abhi.retailchain;

public class WsProductEvent {
    private String type;   // CREATE | UPDATE | DELETE
    private Product product;

    public WsProductEvent() {}

    public WsProductEvent(String type, Product product) {
        this.type = type;
        this.product = product;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}
