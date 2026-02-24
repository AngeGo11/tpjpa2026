package jpa.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "Billets")
public class BilletsDTO {
    private Long id;
    private String codeBarre;
    private Long commandeId;
    private Long typeBilletId;

    public BilletsDTO() {}
    public BilletsDTO(String codeBarre,  Long commandeId, Long typeBilletId) {
        this.codeBarre = codeBarre;
        this.commandeId = commandeId;
        this.typeBilletId = typeBilletId;
    }

    @XmlElement(name = "id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @XmlElement(name = "codeBarre")
    public String getCodeBarre() {
        return codeBarre;
    }

    public void setCodeBarre(String codeBarre) {
        this.codeBarre = codeBarre;
    }

    @XmlElement(name = "commandeId")
    public Long getCommandeId() {
        return commandeId;
    }

    public void setCommandeId(Long commandeId) {
        this.commandeId = commandeId;
    }

    @XmlElement(name = "typeBilletId")
    public Long getTypeBilletId() {
        return typeBilletId;
    }

    public void setTypeBilletId(Long typeBilletId) {
        this.typeBilletId = typeBilletId;
    }
}
