//=============================================================================
// SWE30003 - Bookstore Web Frontend: About 
// Reference Coding Standard: Google JavaScript Style Guide (ES6 Modules)

export function renderAbout() {
    return `
        <div class="view-content animate-fade">
            <h2>ℹ️ About Our Store</h2>
            <p><b>Favourite Books</b> operates as a hybrid local and online bookstore ecosystem located at our main brick-and-mortar storefront on Glenferrie Road.</p>
            
            <h3>Architectural Goals</h3>
            <p>This software platform was engineered as an object-oriented implementation model to satisfy strict usability requirements, boundary validation constraints, and multi-layered domain cohesion strategies.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr style="background-color: #e9ecef; text-align: left;">
                    <th style="padding: 8px; border: 1px solid #dee2e6;">Campus Location</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6;">Unit Code</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6;">System Focus</th>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #dee2e6;">Hawthorn, VIC</td>
                    <td style="padding: 8px; border: 1px solid #dee2e6;">SWE30003</td>
                    <td style="padding: 8px; border: 1px solid #dee2e6;">Robust Input Validation</td>
                </tr>
            </table>
        </div>
    `;
}